import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2, PlayCircle } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { FormField, fieldA11y } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useDemoEntry } from '../../hooks/useDemoEntry';
import { hasErrors, isEmail, type Errors } from '../../utils/validation';
import { btn, cx, inputClass } from '../../utils/styles';

export function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/app';
  const { enter, pending: demoPending } = useDemoEntry();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors<'email' | 'password'>>({});
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const errs: Errors<'email' | 'password'> = {
      email: !email.trim() ? 'Enter your email address.' : !isEmail(email) ? 'Enter a valid email address.' : undefined,
      password: password.length < 8 ? 'Password must be at least 8 characters.' : undefined
    };
    setErrors(errs);
    setFormError('');
    if (hasErrors(errs)) return;
    setPending(true);
    try {
      const user = await signIn(email, password);
      navigate(user.onboarded ? next : '/onboarding', { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your planning workspace.">
      <button type="button" onClick={() => enter(next)} disabled={demoPending} className={cx(btn.base, btn.lime, btn.lg, 'w-full')}>
        {demoPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <PlayCircle className="h-4 w-4" aria-hidden="true" />}
        Explore the live demo — no account needed
      </button>
      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-smoke">
        <span className="h-px flex-1 bg-line" /> or sign in <span className="h-px flex-1 bg-line" />
      </div>
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError &&
        <div role="alert" className="flex gap-2 rounded-xl border border-danger/30 bg-[#FADBD4] p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {formError}
          </div>
        }
        <FormField label="Email" htmlFor="email" error={errors.email}>
          <Input {...fieldA11y('email', errors.email)} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password}>
          <PasswordInput {...fieldA11y('password', errors.password)} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>
        <div className="flex justify-end">
          <Link to="/recover" className="text-sm font-medium text-ink underline-offset-4 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" disabled={pending} aria-busy={pending} className={cx(btn.base, btn.ink, btn.lg, 'w-full')}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-smoke">
        New to JolliFlow? <Link to="/signup" className="font-semibold text-ink underline-offset-4 hover:underline">Create an account</Link>
      </p>
      <p className="mt-6 rounded-xl bg-sand p-3 text-xs leading-relaxed text-smoke">
        Prototype sign-in: accounts are stored only in this browser and passwords are never stored or verified. Demo account: <span className="font-semibold text-ink">ada@demo.jolliflow.ng</span> with any 8+ character password.
      </p>
    </AuthLayout>);

}