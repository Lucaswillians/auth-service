import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 45 }) // Suporta IPv4 e IPv6
  ip: string;

  @CreateDateColumn({ type: 'timestamp' }) // Define automaticamente a data de criação
  attemptTime: Date;
}
