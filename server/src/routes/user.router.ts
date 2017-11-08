import {Router, Request, Response} from 'express';
import { UserRepository } from '../db/repositories/user.repository';
import { UserModel } from '../db/models/user.model';


/**********************************************************************************************************
 * User ROUTER
 * /api/user
 * Responsible for getting user based information
 *********************************************************************************************************/
export class UserRouter {
    router: Router;
    userRepository: UserRepository;

    constructor() {
        this.router = Router();
        this.userRepository = new UserRepository();
        this.init();
    }

    init() {
        this.router.get('/profile', (req: Request, res: Response) => {
            res.json(req.user);
        });

        this.router.post('/profilephoto', (req: Request, res: Response) => {
             this.userRepository.findById(req.user._id).then((user: UserModel) => {
                 user.setProfilePhotoUrl(req.body).then(() => res.status(200).send()).catch(error => res.status(500).send(error));
             }).catch(error => res.status(500).send(error));
        });
    }

}

export default new UserRouter().router;