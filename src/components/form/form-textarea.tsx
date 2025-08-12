import { FormInputProps } from '@/components/form/input.types';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FieldValues } from 'react-hook-form';

type FormTextareaProps<TFieldValues extends FieldValues> =
  FormInputProps<TFieldValues> & {
    placeholder?: string;
    description?: string;
    className?: string;
    rows?: number;
    grow?: boolean;
  };

export function FormTextarea<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  disabled,
  className,
  placeholder,
  description,
  rows,
  grow,
}: FormTextareaProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem className={cn(grow && 'flex-1 flex flex-col')}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl className={cn(grow && 'flex-1')}>
            <Textarea
              className={cn(className, 'text-sm', grow && 'grow h-full')}
              placeholder={placeholder}
              rows={rows}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

FormTextarea.displayName = 'FormTextarea';
