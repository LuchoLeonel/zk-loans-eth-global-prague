import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from './score.entity';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
  ) {}

  async getScore(address: string): Promise<Score | null> {
    return this.scoreRepository.findOneBy({ address });
  }

  async saveScore(
    address: string,
    score: number,
    probability: number,
    maxLoan: number,
    firstName: string,
    lastName: string,
    documentType: string,
    documentNumber: string,
  ): Promise<Score> {
    const newScore = this.scoreRepository.create({
      address,
      score,
      probability,
      maxLoan,
      firstName,
      lastName,
      documentType,
      documentNumber,
    });
    return this.scoreRepository.save(newScore);
  }
}
