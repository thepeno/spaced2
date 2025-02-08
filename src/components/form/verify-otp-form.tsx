import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { verifyOtpFormSchema, VerifyOtpFormValues } from '@/lib/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

type VerifyOtpProps = {
  onSubmit: (data: VerifyOtpFormValues) => Promise<void>;
};

export default function VerifyOtpForm({ onSubmit }: VerifyOtpProps) {
  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpFormSchema),
    defaultValues: {
      pin: '',
    },
  });

  const pinWatch = form.watch('pin');

  // Auto submit when the user has entered the 8 digits
  useEffect(() => {
    if (pinWatch.length === 8) {
      form.handleSubmit(onSubmit)();
    }
  }, [pinWatch, form, onSubmit]);

  return (
    <Form {...form}>
      <form className='w-full space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='pin'
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={8}
                  {...field}
                  onChange={(value) => onChange(value.toUpperCase())}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                    <InputOTPSlot index={6} />
                    <InputOTPSlot index={7} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Please enter the one-time password sent to your email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
