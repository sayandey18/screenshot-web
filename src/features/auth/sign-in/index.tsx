import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { AuthLayout } from '../components/auth-layout'
import { SignInForm } from './components/sign-in-form'
import { otpContext } from '../utils/otp-context'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in/' })
  const navigate = useNavigate()

  return (
    <AuthLayout
      title='Sign in'
      description='Enter your credentials below to login to your account'
    >
      <SignInForm
        redirectTo={redirect}
        onTwoFactorRequired={(userEmail) => {
          otpContext.set('otp:login-2fa', {
            intent: 'sign_in_2fa',
            email: userEmail,
            redirect: redirect,
          })
          navigate({ to: '/sign-in/2fa' })
        }}
      />
      <p className='px-8 text-center text-sm text-muted-foreground mt-4'>
        By clicking sign in, you agree to our{' '}
        <a href='/terms' className='underline underline-offset-4 hover:text-primary'>
          Terms of Service
        </a>{' '}
        and{' '}
        <a href='/privacy' className='underline underline-offset-4 hover:text-primary'>
          Privacy Policy
        </a>
      </p>
      <p className='mt-4 text-center text-sm text-muted-foreground'>
        Don&apos;t have an account?{' '}
        <Link to='/sign-up' className='underline underline-offset-4 hover:text-primary'>
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  )
}
