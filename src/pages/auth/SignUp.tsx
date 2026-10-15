import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { FormField, fieldA11y } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { hasErrors, isEmail, type Errors } from '../../utils/validation';
import { btn, cx, inputClass } from '../../utils/styles';

type Field = 'name' | 'email' | 'password' | 'terms';

export function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const errs: Errors<Field> = {
      name: name.trim().length < 2 ? 'Enter your name.' : undefined,
      email: !isEmail(email) ? 'Enter a valid email address.' : undefined,
      password: password.length < 8 ? 'Use at least 8 characters.' : undefined,
      terms: !terms ? 'Please accept the prototype terms to continue.' : undefined
    };
    setErrors(errs);
    setFormError('');
    if (hasErrors(errs)) return;
    setPending(true);
    try {
      await signUp({ name, email, password });
      toast.success('Account created on this device.');
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Couldn’t create your account.');
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start planning in under a minute.">
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError &&
        <div role="alert" className="flex gap-2 rounded-xl border border-danger/30 bg-[#FADBD4] p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {formError}
          </div>
        }
        <FormField label="Full name" htmlFor="name" error={errors.name}>
          <Input {...fieldA11y('name', errors.name)} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email}>
          <Input {...fieldA11y('email', errors.email)} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters.">
          <PasswordInput {...fieldA11y('password', errors.password, 'At least 8 characters.')} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>
        <div>
          <label className="flex items-start gap-3 text-sm text-smoke">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} aria-invalid={errors.terms ? true : undefined} aria-describedby={errors.terms ? 'terms-error' : undefined} className="mt-0.5 h-5 w-5 rounded border-ink accent-ink" />
            <span>I understand this is a prototype and agree to the <Link to="/terms" className="font-semibold text-ink underline">terms</Link> and <Link to="/privacy" className="font-semibold text-ink underline">privacy notice</Link>.</span>
          </label>
          {errors.terms && <p id="terms-error" role="alert" className="mt-1 text-xs font-medium text-danger">{errors.terms}</p>}
        </div>
        <Button type="submit" disabled={pending} aria-busy={pending} className={cx(btn.base, btn.ink, btn.lg, 'w-full')}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-smoke">
        Already have an account? <Link to="/signin" className="font-semibold text-ink underline-offset-4 hover:underline">Sign in</Link>
      </p>
    </AuthLayout>);

}