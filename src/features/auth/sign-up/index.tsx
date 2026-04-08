import { Link, useNavigate } from '@tanstack/react-router'
import { AuthLayout } from '../components/auth-layout'
import { SignUpForm } from './components/sign-up-form'
import { otpContext } from '../utils/otp-context'

export function SignUp() {
  const navigate = useNavigate()

  return (
    <AuthLayout
      title='Sign up'
      description='Enter your credentials below to create an account'
    >
      <SignUpForm
        onSuccess={(registeredEmail) => {
          otpContext.set('otp:signup', {
            intent: 'sign_up_verify',
            email: registeredEmail,
            redirect: '/dashboard',
          })
          navigate({ to: '/sign-up/verify' })
        }}
      />
      <p className='px-8 text-center text-sm text-muted-foreground mt-4'>
        By clicking create account, you agree to our{' '}
        <a href='/terms' className='underline underline-offset-4 hover:text-primary'>
          Terms of Service
        </a>{' '}
        and{' '}
        <a href='/privacy' className='underline underline-offset-4 hover:text-primary'>
          Privacy Policy
        </a>
      </p>
      <p className='mt-4 text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link to='/sign-in' className='underline underline-offset-4 hover:text-primary'>
          Sign In
        </Link>
      </p>
    </AuthLayout>
  )
}
