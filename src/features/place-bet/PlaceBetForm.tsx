import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuction } from '@/entities/auction/api/use-auction-queries'
import { ValidationError } from '@/entities/bet/api/bet-api'
import { useSetBet } from '@/entities/bet/api/use-bet-queries'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'
import './PlaceBetForm.css'

// No `@hookform/resolvers` package is installed, so the zod schema isn't
// wired up via react-hook-form's `resolver` option. It still expresses the
// validation rule in one place; `register`'s `validate` option below just
// invokes it manually.
const priceSchema = z.number().positive()

type PlaceBetFormValues = {
  price: string
}

type PlaceBetFormProps = {
  auctionUuid: string
}

export function PlaceBetForm({ auctionUuid }: PlaceBetFormProps) {
  const { data: auction } = useAuction(auctionUuid)
  const { mutate, isPending } = useSetBet(auctionUuid)
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlaceBetFormValues>({ defaultValues: { price: '' } })

  const canSetBet = auction?.trading?.can_set_bet ?? false

  function onSubmit(values: PlaceBetFormValues) {
    setSubmitError(undefined)
    mutate(Number(values.price), {
      onSuccess: () => reset({ price: '' }),
      onError: (error) => {
        setSubmitError(error instanceof ValidationError ? error.message : 'Не удалось сделать ставку')
      },
    })
  }

  return (
    <form className="place-bet" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Ваша ставка"
        type="number"
        step="any"
        inputMode="decimal"
        disabled={!canSetBet || isPending}
        error={errors.price?.message ?? submitError}
        {...register('price', {
          validate: (value) =>
            priceSchema.safeParse(Number(value)).success || 'Цена должна быть больше 0',
        })}
      />
      <Button type="submit" disabled={!canSetBet} loading={isPending}>
        Сделать ставку
      </Button>
    </form>
  )
}
