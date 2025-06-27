import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GatewayService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('GatewayService');
  private baristaRooms = new Map<string, Set<string>>();
  private clientUserMap = new Map<string, any>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      this.logger.log(`Connection attempt from client: ${client.id}`);
      this.logger.log(`Token provided: ${!!token ? 'Yes' : 'No'}`);
      
      if (!token) {
        this.logger.error(`No token provided by client: ${client.id}`);
        throw new UnauthorizedException('No token provided');
      }

      this.logger.log(`Verifying token for client: ${client.id}`);
      const payload = await this.jwtService.verifyAsync(token);
      this.clientUserMap.set(client.id, payload);
      
      this.logger.log(`Client connected successfully: ${client.id} (User: ${payload.phoneNumber}, Role: ${payload.role})`);
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}: ${error.message}`);
      if (error.name === 'TokenExpiredError') {
        this.logger.error(`Token expired for client: ${client.id}`);
      } else if (error.name === 'JsonWebTokenError') {
        this.logger.error(`Invalid token for client: ${client.id}`);
      }
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.clientUserMap.get(client.id);
    this.logger.log(`Client disconnected: ${client.id} (User: ${user?.email || 'unknown'})`);
    
    // Remove client from all barista rooms
    this.baristaRooms.forEach((clients, branchId) => {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.baristaRooms.delete(branchId);
      }
    });
    
    this.clientUserMap.delete(client.id);
  }

  @SubscribeMessage('joinBaristaRoom')
  handleJoinBaristaRoom(client: Socket, branchId: string) {
    const user = this.clientUserMap.get(client.id);
    this.logger.log(`Join barista room request: clientId=${client.id}, branchId=${branchId}, user=${JSON.stringify(user)}`);
    
    if (!user || (user.role !== 'BARISTA' && user.role !== 'ADMIN')) {
      this.logger.warn(`Unauthorized attempt to join barista room: ${client.id} (role: ${user?.role})`);
      return;
    }

    if (!this.baristaRooms.has(branchId)) {
      this.baristaRooms.set(branchId, new Set());
    }
    const room = this.baristaRooms.get(branchId);
    if (room) {
      room.add(client.id);
      client.join(`barista-${branchId}`);
      this.logger.log(`Client ${client.id} joined barista room for branch ${branchId}`);
      
      // Send confirmation back to client
      client.emit('joinedBaristaRoom', { branchId, success: true });
    }
  }

  @SubscribeMessage('leaveBaristaRoom')
  handleLeaveBaristaRoom(client: Socket, branchId: string) {
    const room = this.baristaRooms.get(branchId);
    if (room) {
      room.delete(client.id);
      if (room.size === 0) {
        this.baristaRooms.delete(branchId);
      }
      client.leave(`barista-${branchId}`);
      this.logger.log(`Client ${client.id} left barista room for branch ${branchId}`);
    }
  }

  notifyNewOrder(branchId: string, order: any) {
    this.server.to(`barista-${branchId}`).emit('newOrder', order);
    this.logger.log(`Notified baristas in branch ${branchId} about new order`);
  }

  notifyOrderStatusUpdate(branchId: string, orderId: string, status: string) {
    this.server.to(`barista-${branchId}`).emit('orderStatusUpdate', { orderId, status });
    this.logger.log(`Notified baristas in branch ${branchId} about order ${orderId} status update`);
  }
} 