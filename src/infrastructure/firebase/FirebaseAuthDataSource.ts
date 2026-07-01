import { getAuth, signInWithEmailAndPassword, signOut } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { AuthUser, IAuthDataSource } from '../../domain/datasources/IAuthDataSource';
import Logger from '../../core/logger/Logger';
import { getPermissionsForRole } from '../../core/auth/RoleMappings';

export class FirebaseAuthDataSource implements IAuthDataSource {
  async login(email: string, password: string): Promise<AuthUser> {
    const authInstance = getAuth();
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    const userDoc = await firestore().collection('users').doc(userCredential.user.uid).get();
    
    if (!userDoc.exists) {
      throw new Error('User record not found in database');
    }
    
    const data = (userDoc.data() as any) || {};
    return {
      id: userCredential.user.uid,
      email: data.email || email,
      name: data.name || 'Unknown',
      role: data.role || 'Unknown',
      organizationId: data.organizationId || 'Unknown',
      permissions: getPermissionsForRole(data.role),
    };
  }

  async logout(): Promise<void> {
    const authInstance = getAuth();
    await signOut(authInstance);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const authInstance = getAuth();
    const currentUser = authInstance.currentUser;
    if (!currentUser) return null;

    try {
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      if (!userDoc.exists) return null;
      
      const data = (userDoc.data() as any) || {};
      return {
        id: currentUser.uid,
        email: data.email || currentUser.email,
        name: data.name || 'Unknown',
        role: data.role || 'Unknown',
        organizationId: data.organizationId || 'Unknown',
        permissions: getPermissionsForRole(data.role),
      };
    } catch (error) {
      Logger.error('Failed to get current user details', error);
      return null;
    }
  }

  async refreshToken(): Promise<string> {
    const authInstance = getAuth();
    const currentUser = authInstance.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    return await currentUser.getIdToken(true);
  }
}
