import React from 'react'

function SignIn() {
  const handleSignIn = () => {
    const AuthURL = `${
      import.meta.env.DEV ? import.meta.env.VITE_DEV_AUTH_URL : import.meta.env.VITE_PRO_AUTH_URL
    }?callbackUrl=flarecast://app/auth/success`

    window.open(AuthURL, '_blank')
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <button
        onClick={handleSignIn}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Sign In
      </button>
    </div>
  )
}

export default SignIn
