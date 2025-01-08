import { X } from 'lucide-react'
import { Button } from '../ui/button'

function SignIn() {
  const handleSignIn = () => {
    const AuthURL = `${
      import.meta.env.DEV ? import.meta.env.VITE_DEV_AUTH_URL : import.meta.env.VITE_PRO_AUTH_URL
    }?callbackUrl=flarecast://app/auth/success`

    window.open(AuthURL, '_blank')
  }

  const handleSignUp = () => {
    const SignUpURL = `${
      import.meta.env.DEV
        ? import.meta.env.VITE_DEV_SIGNUP_URL
        : import.meta.env.VITE_PRO_SIGNUP_URL
    }?callbackUrl=flarecast://app/auth/success`

    window.open(SignUpURL, '_blank')
  }

  const handleCloseWindow = () => {
    if (window.api?.window?.close) {
      window.api.window.close()
    } else {
      console.warn('Close window functionality is not available.')
    }
  }

  return (
    <div className="relative w-screen h-screen bg-gray-100 draggable">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 non-draggable"
        onClick={handleCloseWindow}
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Authentication Buttons */}
      <div className="flex flex-col items-center justify-center h-full">
        <button
          onClick={handleSignIn}
          className="mb-4 px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
        >
          Sign In
        </button>
        <button
          onClick={handleSignUp}
          className="px-6 py-3 text-white bg-green-500 rounded-lg hover:bg-green-600 transition"
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}

export default SignIn
