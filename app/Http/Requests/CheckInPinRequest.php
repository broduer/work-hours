<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Override;

final class CheckInPinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'pin' => ['required', 'digits:4'],
        ];
    }

    #[Override]
    public function messages(): array
    {
        return [
            'pin.required' => 'Please enter your 4-digit PIN.',
            'pin.digits' => 'Your PIN must be exactly 4 digits.',
        ];
    }
}
