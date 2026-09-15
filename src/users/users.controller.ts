import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Req() req: RequestWithUser) {
    return this.usersService.findOne(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    return this.usersService.updateUser(id, updateUserDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deleteUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.usersService.deleteUser(id, req.user);
  }
}
