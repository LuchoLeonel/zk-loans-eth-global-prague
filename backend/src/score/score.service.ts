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

  async createLoan(
    address: string,
    hash: string,
    signature: string,
    legalDocument: string,
  ) {
    const scoreRecord = await this.scoreRepository.findOneBy({ address });

    if (!scoreRecord) {
      throw new Error(`No score record found for address ${address}`);
    }

    scoreRecord.hash = hash;
    scoreRecord.signature = signature;
    scoreRecord.legalDocument = legalDocument;

    await this.scoreRepository.save(scoreRecord);

    return {
      message: 'Loan data updated successfully',
      data: scoreRecord,
    };
  }

}
