import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { aurifySignIn, aurifySignUp } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      /*
       * README: Do we have a need to access google token?
       * TODO: If we do, implement a way to store refresh token
       *
       * const credidential = GoogleAuthProvider.credentialFromResult(result);
       * GoogleAuthProvider.credential(await auth.currentUser.getIdToken());
       * const token = credidential.accessToken;
       */

      const user = result.user;

      toast({
        title: "Welcome back!",
        description: `Signed in as ${user.displayName || user.email}`
      });
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const user = await aurifySignIn(email, password);

      toast({
        title: "Welcome back!",
        description: `Signed in as ${user.email}`
      });
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      // const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = await aurifySignUp(email, password);
      await sendEmailVerification(user);
      await updateProfile(user, {
        displayName: name
      })
      toast({
        title: "Account created!",
        description: `Welcome to Aurify, ${user.displayName}!`
      });
    } catch (error: any) {
      console.error('Email sign-up error:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out"
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
