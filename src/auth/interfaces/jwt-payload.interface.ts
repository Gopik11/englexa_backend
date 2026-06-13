import { AppRole } from '../../common/constants/roles';

export interface AuthJwtPayload {
  sub: string;
  email: string;
  role: AppRole;
  type: 'access' | 'refresh';
}
