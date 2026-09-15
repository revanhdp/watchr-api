import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  private readonly userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  };

  async findAll() {
    return await this.prisma.user.findMany({
      select: this.userSelect,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: { userId: string; role: string },
  ) {
    if (currentUser.role !== 'ADMIN' && currentUser.userId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    if (currentUser.role !== 'ADMIN' && (updateUserDto as any).role) {
      throw new ForbiddenException('Only admins can change user roles');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const dataToUpdate: any = { ...updateUserDto };
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: this.userSelect,
    });
  }

  async deleteUser(id: string, currentUser: { userId: string; role: string }) {
    if (currentUser.role !== 'ADMIN' && currentUser.userId !== id) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return await this.prisma.user.delete({
      where: { id },
      select: this.userSelect,
    });
  }
}
