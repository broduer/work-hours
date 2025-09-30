<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Rules\UnauthorizedEmailProviders;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateTeamMemberRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore(request('email'), 'email'), new UnauthorizedEmailProviders()],
            'password' => ['nullable', 'string', 'min:8'],
            'hourly_rate' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:3'],
            'non_monetary' => ['sometimes', 'boolean'],
            'is_employee' => ['sometimes', 'boolean'],
            'enable_clockin' => ['sometimes', 'boolean'],
            'clockin_pin' => ['nullable', 'digits:4', 'required_if:enable_clockin,true', Rule::unique('teams', 'clockin_pin')->where(fn ($q) => $q
                ->where('user_id', auth()->id())
                ->where('member_id', '!=', optional($this->route('user'))->getKey()))],
            'clockout_duration' => ['nullable', 'numeric', 'min:0', 'required_if:enable_clockin,true'],
        ];
    }
}
