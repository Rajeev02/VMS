import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { AuthUser, IAuthDataSource } from '../../domain/datasources/IAuthDataSource';
import Logger from '../../core/logger/Logger';

export class FirebaseAuthDataSource implements IAuthDataSource {
  async login(email: string, password: string): Promise<AuthUser> {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const userDoc = await firestore().collection('users').doc(userCredential.user.uid).get();
    
    if (!userDoc.exists) {
      throw new Error('User record not found in database');
    }
    
    const data = userDoc.data() as any;
    return {
      id: userCredential.user.uid,
      email: data.email || email,
      name: data.name,
      role: data.role,
      organizationId: data.organizationId,
      permissions: data.permissions || [],
    };
  }

  async logout(): Promise<void> {
    await auth().signOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const currentUser = auth().currentUser;
    if (!currentUser) return null;

    try {
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      if (!userDoc.exists) return null;
      
      const data = userDoc.data() as any;
      return {
        id: currentUser.uid,
        email: data.email || currentUser.email,
        name: data.name,
        role: data.role,
        organizationId: data.organizationId,
        permissions: data.permissions || [],
      };
    } catch (error) {
      Logger.error('Failed to get current user details', error);
      return null;
    }
  }

  async refreshToken(): Promise<string> {
    const currentUser = auth().currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    return await currentUser.getIdToken(true);
  }
}
