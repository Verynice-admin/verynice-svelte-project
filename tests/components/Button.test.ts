import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Button from '$components/ui/Button.svelte';

describe('Button Component', () => {
    it('renders with default props', () => {
        const { container } = render(Button, { props: {} });
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
    });

    it('applies variant classes', () => {
        const { container } = render(Button, { props: { variant: 'primary' } });
        const button = container.querySelector('button');
        expect(button).toHaveClass('btn-primary');
    });

    it('applies size classes', () => {
        const { container } = render(Button, { props: { size: 'lg' } });
        const button = container.querySelector('button');
        expect(button).toHaveClass('btn-lg');
    });

    it('handles disabled state', () => {
        const { container } = render(Button, { props: { disabled: true } });
        const button = container.querySelector('button');
        expect(button).toBeDisabled();
    });

    it('shows loading state', () => {
        const { container } = render(Button, { props: { loading: true } });
        const button = container.querySelector('button');
        expect(button).toHaveClass('loading');
    });
});
