import Head from 'next/head';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - Decodr | AI Message Analyzer</title>
        <meta name="description" content="Log in or sign up to Decodr. Get 10 free AI-powered message analyses to decode what they really mean." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <LoginForm />
    </>
  );
}
