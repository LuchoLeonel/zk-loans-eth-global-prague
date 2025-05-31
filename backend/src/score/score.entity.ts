import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Score {
  @PrimaryColumn()
  address: string;

  @Column()
  score: number;

  @Column()
  probability: number;

  @Column()
  maxLoan: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  documentType: string;

  @Column()
  documentNumber: string;
}
