import { Request, Response, Router } from 'express';
import { ChatService } from '../services/chat.service';
import { ChatRoomModel } from '../db/models/chat-room.model';
import { ChatType } from '../../../shared/types/mq/chat-type.enum';
import { ChatRoomData } from '../../../shared/types/mq/chat-room.data';
import { ChatMessage } from '../../../shared/types/mq/chat';


/**********************************************************************************************************
 * Chat ROUTER
 * /api/chat
 * Responsible for getting and setting chat data
 *********************************************************************************************************/
export class ChatRouter {
	router: Router;

	private chatService: ChatService;

	constructor() {
		this.router = Router();
		this.chatService = new ChatService();
		this.init();
	}

	private init(): void {
		this.router.get('/chatrooms', async (req: Request, res: Response) => {
			try {
				const userId: string = req.user._id;
				const rooms: ChatRoomData[] = await this.chatService.getAllChatRooms(userId);
				res.json(rooms);
			}
			catch (error) {
				console.error(error);
				res.status(500).send(error);
			}
		});

		this.router.post('/new/room', async (req: Request, res: Response) => {
			try {
				const userId: string = req.user._id;
				const room: ChatRoomModel = await this.chatService.createChatRoom(userId, ChatType.USER);
				res.status(200).json(room);
			}
			catch (error) {
				console.error(error);
				res.status(500).send(error);
			}
		});

		this.router.post('/adduser', async (req: Request, res: Response) => {
			try {
				const userId: string = req.user._id;
				const inviteeId: string = req.body.userId;
				const roomId: string = req.body.roomId;
				const room: ChatRoomModel = await this.chatService.addUserToRoom(userId, inviteeId, roomId);
				res.json(room);
			}
			catch (error) {
				console.error(error);
				res.status(500).send(error);
			}
		});

		this.router.post('/roomOfUsers', async (req: Request, res: Response) => {
			try {
				const userIds: string[] = req.body.userIds;
				const userId: string = req.user._id;
				const room: ChatRoomModel = await this.chatService.getOrCreateRoomOfUsers(userId, userIds);
				res.json(room);
			}
			catch (error) {
				console.error(error);
				res.status(500).send(error);
			}
		});

		this.router.post('/save', async (req: Request, res: Response) => {
			try {
				const userId: string = req.user._id;
				const chatMessage: ChatMessage = req.body.chat;
				await this.chatService.saveChat(userId, chatMessage);
				res.status(200).send();
			}
			catch (error) {
				console.error(error);
				res.status(500).send(error);
			}
		});

		this.router.post('/check', async (req: Request, res: Response) => {
			try {
				const userId: string = req.user._id;
				const roomId: string = req.body.roomId;
				await this.chatService.checkChatRoom(userId, roomId);
				res.send();
			}
			catch (error) {
				console.error(error);
				res.status(500).send(error);
			}
		});
	}
}

export default new ChatRouter().router;