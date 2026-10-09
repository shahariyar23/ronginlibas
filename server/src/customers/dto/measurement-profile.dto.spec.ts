import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { MeasurementProfileDto } from './measurement-profile.dto.js';

describe('MeasurementProfileDto', () => {
  it('accepts decimal measurements up to the database precision', () => {
    const dto = plainToInstance(MeasurementProfileDto, {
      shoulder: '14.4',
      chest: '16.4',
      garmentLength: '157.48',
      collar: '15.25',
    });

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.shoulder).toBe(14.4);
    expect(dto.chest).toBe(16.4);
    expect(dto.garmentLength).toBe(157.48);
    expect(dto.collar).toBe(15.25);
  });

  it('rejects measurements with more than two decimal places', () => {
    const dto = plainToInstance(MeasurementProfileDto, { chest: '16.444' });

    expect(validateSync(dto).map((error) => error.property)).toContain('chest');
  });
});
