import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { ContentStatus, CommentStatus } from '@prisma/client';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ==========================================
  // PUBLIC ENDPOINTS (GUESTS & CUSTOMERS)
  // ==========================================

  // --- Portfolio ---
  @Get('portfolio')
  @UseGuards(OptionalJwtAuthGuard)
  async findAllPortfolio(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('status') status?: ContentStatus,
    @Request() req?: any,
  ) {
    const hasAdminAccess = req?.user && (req.user.role === 'SYSTEM_ADMIN' || req.user.role === 'ADMIN');
    return this.contentService.findAllPortfolioProjects({
      skip,
      take,
      search,
      status,
      onlyPublished: !hasAdminAccess,
    });
  }

  @Get('portfolio/:id')
  async findOnePortfolio(@Param('id') id: string) {
    return this.contentService.findOnePortfolioProject(id);
  }

  // --- News ---
  @Get('news')
  @UseGuards(OptionalJwtAuthGuard)
  async findAllNews(
    @Query('search') search?: string,
    @Query('status') status?: ContentStatus,
    @Request() req?: any,
  ) {
    const hasAdminAccess = req?.user && (req.user.role === 'SYSTEM_ADMIN' || req.user.role === 'ADMIN');
    return this.contentService.findAllNews({
      search,
      status,
      onlyPublished: !hasAdminAccess,
    });
  }

  @Get('news/:id')
  async findOneNews(@Param('id') id: string) {
    return this.contentService.findOneNews(id);
  }

  // --- Articles ---
  @Get('articles')
  @UseGuards(OptionalJwtAuthGuard)
  async findAllArticles(
    @Query('search') search?: string,
    @Query('status') status?: ContentStatus,
    @Request() req?: any,
  ) {
    const hasAdminAccess = req?.user && (req.user.role === 'SYSTEM_ADMIN' || req.user.role === 'ADMIN');
    return this.contentService.findAllArticles({
      search,
      status,
      onlyPublished: !hasAdminAccess,
    });
  }

  @Get('articles/:id')
  async findOneArticle(@Param('id') id: string) {
    return this.contentService.findOneArticle(id);
  }

  // --- Tips ---
  @Get('tips')
  @UseGuards(OptionalJwtAuthGuard)
  async findAllTips(@Request() req?: any) {
    const hasAdminAccess = req?.user && (req.user.role === 'SYSTEM_ADMIN' || req.user.role === 'ADMIN');
    return this.contentService.findAllTips(!hasAdminAccess);
  }

  // --- Achievements ---
  @Get('achievements')
  @UseGuards(OptionalJwtAuthGuard)
  async findAllAchievements(@Request() req?: any) {
    const hasAdminAccess = req?.user && (req.user.role === 'SYSTEM_ADMIN' || req.user.role === 'ADMIN');
    return this.contentService.findAllAchievements(!hasAdminAccess);
  }

  // --- Testimonials ---
  @Get('testimonials')
  @UseGuards(OptionalJwtAuthGuard)
  async findAllTestimonials(@Request() req?: any) {
    const hasAdminAccess = req?.user && (req.user.role === 'SYSTEM_ADMIN' || req.user.role === 'ADMIN');
    return this.contentService.findAllTestimonials(!hasAdminAccess);
  }

  // --- Static Pages ---
  @Get('pages/:slug')
  async findPage(@Param('slug') slug: string) {
    return this.contentService.findStaticPage(slug);
  }


  // ==========================================
  // CLIENT INTERACTIONS (AUTHENTICATED)
  // ==========================================

  @Post('comments')
  @UseGuards(JwtAuthGuard)
  async addComment(@Request() req: any, @Body() body: any) {
    return this.contentService.addComment(req.user.id, body);
  }

  @Post('ratings')
  @UseGuards(JwtAuthGuard)
  async rate(@Request() req: any, @Body() body: any) {
    return this.contentService.rateEntity(req.user.id, body.value, body);
  }

  @Post('likes')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async like(@Request() req: any, @Body() body: any) {
    return this.contentService.likeEntity(req.user.id, body);
  }

  @Delete('likes')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unlike(@Request() req: any, @Body() body: any) {
    return this.contentService.unlikeEntity(req.user.id, body);
  }


  // ==========================================
  // ADMIN CONTROL & MODERATION (DASHBOARD)
  // ==========================================

  // --- Portfolio CRUD ---
  @Post('portfolio')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'CONTENT' })
  async createPortfolio(@Body() body: any) {
    return this.contentService.createPortfolioProject(body);
  }

  @Patch('portfolio/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'CONTENT' })
  async updatePortfolio(@Param('id') id: string, @Body() body: any) {
    return this.contentService.updatePortfolioProject(id, body);
  }

  @Delete('portfolio/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'CONTENT' })
  async deletePortfolio(@Param('id') id: string) {
    return this.contentService.deletePortfolioProject(id);
  }

  // --- News CRUD ---
  @Post('news')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'CONTENT' })
  async createNewsItem(@Body() body: any) {
    return this.contentService.createNews(body);
  }

  @Patch('news/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'CONTENT' })
  async updateNewsItem(@Param('id') id: string, @Body() body: any) {
    return this.contentService.updateNews(id, body);
  }

  // --- Articles CRUD ---
  @Post('articles')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'CONTENT' })
  async createArticleItem(@Body() body: any) {
    return this.contentService.createArticle(body);
  }

  @Patch('articles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'CONTENT' })
  async updateArticleItem(@Param('id') id: string, @Body() body: any) {
    return this.contentService.updateArticle(id, body);
  }

  @Delete('articles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'CONTENT' })
  async deleteArticleItem(@Param('id') id: string) {
    return this.contentService.deleteArticle(id);
  }

  @Post('tips')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'CONTENT' })
  async createTipItem(@Body() body: any) {
    return this.contentService.createTip(body);
  }

  @Patch('tips/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'CONTENT' })
  async updateTipItem(@Param('id') id: string, @Body() body: any) {
    return this.contentService.updateTip(id, body);
  }

  @Delete('tips/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'CONTENT' })
  async deleteTipItem(@Param('id') id: string) {
    return this.contentService.deleteTip(id);
  }

  // --- Achievements CRUD ---
  @Post('achievements')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'CONTENT' })
  async createAchievementItem(@Body() body: any) {
    return this.contentService.createAchievement(body);
  }

  // --- Pages CRUD ---
  @Post('pages')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'CONTENT' })
  async createPage(@Body() body: any) {
    return this.contentService.createStaticPage(body);
  }

  @Patch('pages/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'CONTENT' })
  async updatePage(@Param('slug') slug: string, @Body() body: any) {
    return this.contentService.updateStaticPage(slug, body);
  }

  // --- Testimonials CRUD & Moderation ---
  @Post('testimonials')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'CREATE', module: 'CONTENT' })
  async createTestimonialItem(@Body() body: any) {
    return this.contentService.createTestimonial(body);
  }

  @Patch('testimonials/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'CONTENT' })
  async moderateTestimonial(@Param('id') id: string, @Body('status') status: ContentStatus) {
    return this.contentService.moderateTestimonial(id, status);
  }

  @Patch('testimonials/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'CONTENT' })
  async updateTestimonialItem(@Param('id') id: string, @Body() body: any) {
    return this.contentService.updateTestimonial(id, body);
  }

  @Delete('testimonials/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'CONTENT' })
  async deleteTestimonialItem(@Param('id') id: string) {
    return this.contentService.deleteTestimonial(id);
  }

  // --- Comments Moderation ---
  @Get('comments/all')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'READ', module: 'CONTENT' })
  async findAllComments(
    @Query('status') status?: CommentStatus,
    @Query('portfolioProjectId') portfolioProjectId?: string,
    @Query('newsId') newsId?: string,
    @Query('articleId') articleId?: string,
  ) {
    return this.contentService.findAllComments({ status, portfolioProjectId, newsId, articleId });
  }

  @Patch('comments/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'UPDATE', module: 'CONTENT' })
  async moderateComment(@Param('id') id: string, @Body('status') status: CommentStatus) {
    return this.contentService.moderateComment(id, status);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  @RequirePermissions({ action: 'DELETE', module: 'CONTENT' })
  async deleteCommentItem(@Param('id') id: string) {
    return this.contentService.deleteComment(id);
  }
}
