import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MoneyInput } from './MoneyInput';
import { NumericKeypad } from './NumericKeypad';

describe('Componentes Financeiros Base', () => {
  describe('MoneyInput', () => {
    it('renderiza o valor inicial formatado em Real', () => {
      render(
        <MoneyInput
          rotulo="Valor do caixa"
          valor={12345} // R$ 123,45
          onValorChange={() => {}}
        />,
      );
      const input = screen.getByRole('textbox', { name: /valor do caixa/i }) as HTMLInputElement;
      expect(input.value).toBe('R$ 123,45');
    });

    it('repassa novos centavos quando o usuário digita', () => {
      const aoMudar = vi.fn();
      render(
        <MoneyInput
          rotulo="Valor"
          valor={100}
          onValorChange={aoMudar}
        />,
      );
      const input = screen.getByRole('textbox', { name: /valor/i });
      fireEvent.change(input, { target: { value: 'R$ 1,50' } });
      expect(aoMudar).toHaveBeenCalledWith(150);
    });
  });

  describe('NumericKeypad', () => {
    it('dispara onDigito com o número correto ao clicar', () => {
      const onDigito = vi.fn();
      render(<NumericKeypad onDigito={onDigito} onApagar={() => {}} />);

      fireEvent.click(screen.getByRole('button', { name: '5' }));
      expect(onDigito).toHaveBeenCalledWith(5);

      fireEvent.click(screen.getByRole('button', { name: '9' }));
      expect(onDigito).toHaveBeenCalledWith(9);
    });

    it('dispara onApagar ao tocar no botão de apagar', () => {
      const onApagar = vi.fn();
      render(<NumericKeypad onDigito={() => {}} onApagar={onApagar} />);

      fireEvent.click(screen.getByRole('button', { name: /apagar último dígito/i }));
      expect(onApagar).toHaveBeenCalled();
    });
  });
});
