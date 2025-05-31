import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ScoreService } from './score.service';

@Controller('score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get(':address')
  async getScore(@Param('address') address: string) {
    const score = await this.scoreService.getScore(address);
    if (!score) {
      return { message: 'No score found for this address' };
    }
    return score;
  }

  @Post()
  async saveScore(
    @Body()
    body: {
      address: string;
      score: number;
      probability: number;
      maxLoan: number;
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
    },
  ) {
    return this.scoreService.saveScore(
      body.address,
      body.score,
      body.probability,
      body.maxLoan,
      body.firstName,
      body.lastName,
      body.documentType,
      body.documentNumber,
    );
  }
}
