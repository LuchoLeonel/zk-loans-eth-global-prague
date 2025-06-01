import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';
import { Score } from './score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Score])],
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule {}
