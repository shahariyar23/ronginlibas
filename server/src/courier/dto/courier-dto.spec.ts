import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateShipmentDto } from './create-shipment.dto.js';
import { CreateReturnRequestDto } from './create-return-request.dto.js';
import { SteadfastWebhookDto } from './steadfast-webhook.dto.js';

describe('Courier DTO Validation', () => {
  describe('CreateShipmentDto', () => {
    it('validates a valid note successfully', async () => {
      const dto = plainToInstance(CreateShipmentDto, {
        note: 'Deliver in afternoon',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('rejects notes exceeding maximum length', async () => {
      const dto = plainToInstance(CreateShipmentDto, {
        note: 'a'.repeat(501),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('CreateReturnRequestDto', () => {
    it('validates a valid return reason', async () => {
      const dto = plainToInstance(CreateReturnRequestDto, {
        reason: 'Customer requested size exchange',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('rejects return reasons exceeding maximum length', async () => {
      const dto = plainToInstance(CreateReturnRequestDto, {
        reason: 'a'.repeat(301),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('SteadfastWebhookDto', () => {
    it('validates a standard webhook payload', async () => {
      const dto = plainToInstance(SteadfastWebhookDto, {
        consignment_id: '123456',
        invoice: 'RL-INV-2026-000001',
        status: 'delivered',
        cod_amount: 1500,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
