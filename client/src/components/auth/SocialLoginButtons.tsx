import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaFacebook, FaTwitter } from "react-icons/fa";
import { toast } from "@/hooks/use-toast";
import { 
  auth, 
  googleProvider, 
  facebookProvider, 
  twitterProvider,
  isFirebaseConfigured
} from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { apiRequest } from "@/lib/queryClient";

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  className?: string;
}

export function SocialLoginButtons({ onSuccess, className }: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: any, providerName: string) => {
    if (!isFirebaseConfigured()) {
      toast({
        title: "Firebase not configured",
        description: "Firebase credentials are not set up yet. Please configure Firebase to use social login.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(providerName);
      
      const result = await signInWithPopup(auth, provider);
      
      // Extract relevant user data based on the provider
      let token, user;
      
      if (providerName === 'google') {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        token = credential?.accessToken;
        user = result.user;
      } else if (providerName === 'facebook') {
        const credential = FacebookAuthProvider.credentialFromResult(result);
        token = credential?.accessToken;
        user = result.user;
      } else if (providerName === 'twitter') {
        const credential = TwitterAuthProvider.credentialFromResult(result);
        token = credential?.accessToken;
        user = result.user;
      }
      
      if (user) {
        // Send the user data to our backend
        const response = await apiRequest('/api/auth/social-login', {
          method: 'POST',
          body: JSON.stringify({
            provider: providerName,
            providerId: user.uid,
            username: user.displayName || user.email?.split('@')[0] || `user_${Date.now()}`,
            email: user.email,
            avatarUrl: user.photoURL,
          })
        });

        toast({
          title: "Login Successful",
          description: `Logged in as ${response.user.username}`
        });

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Social login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Could not log in with social provider",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="outline"
          className="flex items-center justify-center gap-2"
          disabled={isLoading !== null}
          onClick={() => handleSocialLogin(googleProvider, 'google')}
        >
          {isLoading === 'google' ? (
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
          ) : (
            <FaGoogle className="text-red-500" />
          )}
        </Button>
        
        <Button 
          variant="outline"
          className="flex items-center justify-center gap-2"
          disabled={isLoading !== null}
          onClick={() => handleSocialLogin(facebookProvider, 'facebook')}
        >
          {isLoading === 'facebook' ? (
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
          ) : (
            <FaFacebook className="text-blue-600" />
          )}
        </Button>
        
        <Button 
          variant="outline"
          className="flex items-center justify-center gap-2"
          disabled={isLoading !== null}
          onClick={() => handleSocialLogin(twitterProvider, 'twitter')}
        >
          {isLoading === 'twitter' ? (
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
          ) : (
            <FaTwitter className="text-sky-500" />
          )}
        </Button>
      </div>
    </div>
  );
}