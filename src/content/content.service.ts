import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentStatus, CommentStatus } from '@prisma/client';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. PORTFOLIO PROJECTS MANAGEMENT
  // ==========================================

  async createPortfolioProject(data: {
    workProjectId?: string;
    titleAr: string;
    titleEn?: string;
    descriptionAr: string;
    descriptionEn?: string;
    coverImage: string;
    gallery?: string[];
    categoryAr: string;
    categoryEn?: string;
    completionDate: Date;
    locationAr: string;
    locationEn?: string;
    status?: ContentStatus;
    serviceIds?: string[]; // Related service ids
  }) {
    const titleEn = (data.titleEn && data.titleEn.trim() !== '') ? data.titleEn : data.titleAr;
    const descriptionEn = (data.descriptionEn && data.descriptionEn.trim() !== '') ? data.descriptionEn : data.descriptionAr;
    const categoryEn = (data.categoryEn && data.categoryEn.trim() !== '') ? data.categoryEn : data.categoryAr;
    const locationEn = (data.locationEn && data.locationEn.trim() !== '') ? data.locationEn : data.locationAr;

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.portfolioProject.create({
        data: {
          workProjectId: data.workProjectId,
          titleAr: data.titleAr,
          titleEn,
          descriptionAr: data.descriptionAr,
          descriptionEn,
          coverImage: data.coverImage,
          gallery: data.gallery || [],
          categoryAr: data.categoryAr,
          categoryEn,
          completionDate: new Date(data.completionDate),
          locationAr: data.locationAr,
          locationEn,
          status: data.status || 'DRAFT',
        },
      });

      if (data.serviceIds && data.serviceIds.length > 0) {
        await tx.servicePortfolio.createMany({
          data: data.serviceIds.map((serviceId) => ({
            portfolioProjectId: project.id,
            serviceId,
          })),
        });
      }

      return this.findOnePortfolioProject(project.id, tx);
    });
  }

  async findAllPortfolioProjects(params: {
    skip?: number;
    take?: number;
    search?: string;
    status?: ContentStatus;
    onlyPublished?: boolean;
  }) {
    const { skip, take, search, status, onlyPublished } = params;
    const where: any = {};

    if (onlyPublished) {
      where.status = 'PUBLISHED';
    } else if (status) {
      where.status = status;
    } else {
      where.status = { not: 'ARCHIVED' };
    }

    if (search) {
      where.OR = [
        { titleAr: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { descriptionAr: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [portfolioProjects, total] = await Promise.all([
      this.prisma.portfolioProject.findMany({
        where,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        include: {
          services: { include: { service: true } },
          comments: { where: { status: { not: 'REJECTED' } }, include: { customer: true }, orderBy: { createdAt: 'desc' } },
          ratings: true,
          likes: true,
        },
        orderBy: { completionDate: 'desc' },
      }),
      this.prisma.portfolioProject.count({ where }),
    ]);

    // Format output with computed averages
    const formatted = portfolioProjects.map((p) => {
      const ratingsCount = p.ratings.length;
      const ratingsSum = p.ratings.reduce((sum, r) => sum + r.value, 0);
      const averageRating = ratingsCount > 0 ? Number((ratingsSum / ratingsCount).toFixed(2)) : 0;
      return {
        ...p,
        averageRating,
        totalLikes: p.likes.length,
      };
    });

    return { portfolioProjects: formatted, total };
  }

  async findOnePortfolioProject(id: string, tx?: any) {
    const client = tx || this.prisma;
    const project = await client.portfolioProject.findUnique({
      where: { id },
      include: {
        services: { include: { service: true } },
        comments: { where: { status: { not: 'REJECTED' } }, include: { customer: true }, orderBy: { createdAt: 'desc' } },
        ratings: true,
        likes: true,
        workProject: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Portfolio project not found');
    }

    const ratingsCount = project.ratings.length;
    const ratingsSum = project.ratings.reduce((sum: number, r: { value: number }) => sum + r.value, 0);
    const averageRating = ratingsCount > 0 ? Number((ratingsSum / ratingsCount).toFixed(2)) : 0;

    return {
      ...project,
      averageRating,
      totalLikes: project.likes.length,
    };
  }

  async updatePortfolioProject(
    id: string,
    data: {
      workProjectId?: string;
      titleAr?: string;
      titleEn?: string;
      descriptionAr?: string;
      descriptionEn?: string;
      coverImage?: string;
      gallery?: string[];
      categoryAr?: string;
      categoryEn?: string;
      completionDate?: Date;
      locationAr?: string;
      locationEn?: string;
      status?: ContentStatus;
      serviceIds?: string[];
    },
  ) {
    await this.findOnePortfolioProject(id);

    const titleEn = (data.titleEn !== undefined) 
      ? ((data.titleEn && data.titleEn.trim() !== '') ? data.titleEn : (data.titleAr || '')) 
      : undefined;
    const descriptionEn = (data.descriptionEn !== undefined) 
      ? ((data.descriptionEn && data.descriptionEn.trim() !== '') ? data.descriptionEn : (data.descriptionAr || '')) 
      : undefined;
    const categoryEn = (data.categoryEn !== undefined) 
      ? ((data.categoryEn && data.categoryEn.trim() !== '') ? data.categoryEn : (data.categoryAr || '')) 
      : undefined;
    const locationEn = (data.locationEn !== undefined) 
      ? ((data.locationEn && data.locationEn.trim() !== '') ? data.locationEn : (data.locationAr || '')) 
      : undefined;

    return this.prisma.$transaction(async (tx) => {
      await tx.portfolioProject.update({
        where: { id },
        data: {
          workProjectId: data.workProjectId,
          titleAr: data.titleAr,
          ...(titleEn !== undefined ? { titleEn } : {}),
          descriptionAr: data.descriptionAr,
          ...(descriptionEn !== undefined ? { descriptionEn } : {}),
          coverImage: data.coverImage,
          gallery: data.gallery,
          categoryAr: data.categoryAr,
          ...(categoryEn !== undefined ? { categoryEn } : {}),
          completionDate: data.completionDate ? new Date(data.completionDate) : undefined,
          locationAr: data.locationAr,
          ...(locationEn !== undefined ? { locationEn } : {}),
          status: data.status,
        },
      });

      if (data.serviceIds !== undefined) {
        await tx.servicePortfolio.deleteMany({ where: { portfolioProjectId: id } });
        if (data.serviceIds.length > 0) {
          await tx.servicePortfolio.createMany({
            data: data.serviceIds.map((serviceId) => ({
              portfolioProjectId: id,
              serviceId,
            })),
          });
        }
      }

      return this.findOnePortfolioProject(id, tx);
    });
  }

  async deletePortfolioProject(id: string) {
    return this.prisma.portfolioProject.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }


  // ==========================================
  // 2. NEWS, ARTICLES, TIPS, ACHIEVEMENTS
  // ==========================================

  // --- News ---
  async createNews(data: { titleAr: string; titleEn?: string; summaryAr: string; summaryEn?: string; contentAr: string; contentEn?: string; featuredImage: string; gallery?: string[]; status?: ContentStatus }) {
    const titleEn = (data.titleEn && data.titleEn.trim() !== '') ? data.titleEn : data.titleAr;
    const summaryEn = (data.summaryEn && data.summaryEn.trim() !== '') ? data.summaryEn : data.summaryAr;
    const contentEn = (data.contentEn && data.contentEn.trim() !== '') ? data.contentEn : data.contentAr;
    return this.prisma.news.create({ data: { ...data, titleEn, summaryEn, contentEn, gallery: data.gallery || [], status: data.status || 'DRAFT' } });
  }

  async findAllNews(params: { onlyPublished?: boolean; status?: ContentStatus; search?: string }) {
    const where: any = {};
    if (params.onlyPublished) {
      where.status = 'PUBLISHED';
    } else if (params.status) {
      where.status = params.status;
    } else {
      where.status = { not: 'ARCHIVED' };
    }
    if (params.search) {
      where.OR = [
        { titleAr: { contains: params.search, mode: 'insensitive' } },
        { titleEn: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.news.findMany({
      where,
      include: {
        likes: { include: { customer: true } },
        comments: { include: { customer: true }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { publishDate: 'desc' },
    });
  }

  async findOneNews(id: string) {
    const item = await this.prisma.news.findUnique({
      where: { id },
      include: {
        likes: { include: { customer: true } },
        comments: { where: { status: { not: 'REJECTED' } }, include: { customer: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!item) throw new NotFoundException('News item not found');
    return { ...item, totalLikes: item.likes.length };
  }

  async updateNews(id: string, data: any) {
    return this.prisma.news.update({ where: { id }, data });
  }

  // --- Articles ---
  async createArticle(data: { titleAr: string; titleEn?: string; summaryAr: string; summaryEn?: string; contentAr: string; contentEn?: string; author: string; coverImage: string; gallery?: string[]; tags?: string[]; categoryAr: string; categoryEn?: string; status?: ContentStatus }) {
    const titleEn = (data.titleEn && data.titleEn.trim() !== '') ? data.titleEn : data.titleAr;
    const summaryEn = (data.summaryEn && data.summaryEn.trim() !== '') ? data.summaryEn : data.summaryAr;
    const contentEn = (data.contentEn && data.contentEn.trim() !== '') ? data.contentEn : data.contentAr;
    const categoryEn = (data.categoryEn && data.categoryEn.trim() !== '') ? data.categoryEn : data.categoryAr;
    return this.prisma.article.create({ data: { ...data, titleEn, summaryEn, contentEn, categoryEn, gallery: data.gallery || [], tags: data.tags || [], status: data.status || 'DRAFT' } });
  }

  async findAllArticles(params: { onlyPublished?: boolean; status?: ContentStatus; search?: string }) {
    const where: any = {};
    if (params.onlyPublished) {
      where.status = 'PUBLISHED';
    } else if (params.status) {
      where.status = params.status;
    } else {
      where.status = { not: 'ARCHIVED' };
    }
    if (params.search) {
      where.OR = [
        { titleAr: { contains: params.search, mode: 'insensitive' } },
        { titleEn: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.article.findMany({
      where,
      include: {
        likes: { include: { customer: true } },
        comments: { include: { customer: true }, orderBy: { createdAt: 'desc' } },
        _count: {
          select: {
            likes: true,
            comments: { where: { status: { not: 'REJECTED' } } },
          },
        },
      },
      orderBy: { publishDate: 'desc' },
    });
  }

  async findOneArticle(id: string) {
    const item = await this.prisma.article.findUnique({
      where: { id },
      include: {
        likes: { include: { customer: true } },
        comments: { where: { status: { not: 'REJECTED' } }, include: { customer: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!item) throw new NotFoundException('Article not found');
    return { ...item, totalLikes: item.likes.length };
  }

  async updateArticle(id: string, data: any) {
    return this.prisma.article.update({ where: { id }, data });
  }

  async deleteArticle(id: string) {
    return this.prisma.article.delete({ where: { id } });
  }

  // --- Tips ---
  async createTip(data: { titleAr: string; titleEn?: string; descriptionAr: string; descriptionEn?: string; image?: string; status?: ContentStatus }) {
    const titleEn = (data.titleEn && data.titleEn.trim() !== '') ? data.titleEn : data.titleAr;
    const descriptionEn = (data.descriptionEn && data.descriptionEn.trim() !== '') ? data.descriptionEn : data.descriptionAr;
    return this.prisma.engineeringTip.create({ data: { ...data, titleEn, descriptionEn, status: data.status || 'DRAFT' } });
  }

  async findAllTips(onlyPublished = true) {
    return this.prisma.engineeringTip.findMany({ where: onlyPublished ? { status: 'PUBLISHED' } : { status: { not: 'ARCHIVED' } }, orderBy: { publishDate: 'desc' } });
  }

  async updateTip(id: string, data: any) {
    return this.prisma.engineeringTip.update({ where: { id }, data });
  }

  async deleteTip(id: string) {
    return this.prisma.engineeringTip.delete({ where: { id } });
  }

  // --- Achievements ---
  async createAchievement(data: { titleAr: string; titleEn?: string; descriptionAr: string; descriptionEn?: string; images?: string[]; date: Date; status?: ContentStatus }) {
    const titleEn = (data.titleEn && data.titleEn.trim() !== '') ? data.titleEn : data.titleAr;
    const descriptionEn = (data.descriptionEn && data.descriptionEn.trim() !== '') ? data.descriptionEn : data.descriptionAr;
    return this.prisma.companyAchievement.create({ data: { ...data, titleEn, descriptionEn, images: data.images || [], date: new Date(data.date), status: data.status || 'DRAFT' } });
  }

  async findAllAchievements(onlyPublished = true) {
    return this.prisma.companyAchievement.findMany({ where: onlyPublished ? { status: 'PUBLISHED' } : { status: { not: 'ARCHIVED' } }, orderBy: { date: 'desc' } });
  }

  // --- Static Pages ---
  async createStaticPage(data: { slug: string; titleAr: string; titleEn?: string; contentAr: string; contentEn?: string; status?: ContentStatus }) {
    const titleEn = (data.titleEn && data.titleEn.trim() !== '') ? data.titleEn : data.titleAr;
    const contentEn = (data.contentEn && data.contentEn.trim() !== '') ? data.contentEn : data.contentAr;
    return this.prisma.staticPage.create({ data: { ...data, titleEn, contentEn, status: data.status || 'DRAFT' } });
  }

  async findStaticPage(slug: string) {
    const page = await this.prisma.staticPage.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Static page not found');
    return page;
  }

  async updateStaticPage(slug: string, data: any) {
    return this.prisma.staticPage.update({ where: { slug }, data });
  }


  // ==========================================
  // 3. TESTIMONIALS (CUSTOMER REVIEWS)
  // ==========================================

  async createTestimonial(data: {
    customerNameAr: string;
    customerNameEn?: string;
    jobTitleAr?: string;
    jobTitleEn?: string;
    rating: number;
    commentAr: string;
    commentEn?: string;
    image?: string;
    status?: ContentStatus;
  }) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }
    const customerNameEn = (data.customerNameEn && data.customerNameEn.trim() !== '') ? data.customerNameEn : data.customerNameAr;
    const commentEn = (data.commentEn && data.commentEn.trim() !== '') ? data.commentEn : data.commentAr;
    const jobTitleEn = (data.jobTitleEn && data.jobTitleEn.trim() !== '') ? data.jobTitleEn : data.jobTitleAr;

    return this.prisma.testimonial.create({
      data: {
        ...data,
        customerNameEn,
        commentEn,
        jobTitleEn,
        status: data.status || 'DRAFT',
      },
    });
  }

  async findAllTestimonials(onlyPublished = true) {
    return this.prisma.testimonial.findMany({
      where: onlyPublished ? { status: 'PUBLISHED' } : { status: { not: 'ARCHIVED' } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async moderateTestimonial(id: string, status: ContentStatus) {
    return this.prisma.testimonial.update({
      where: { id },
      data: { status },
    });
  }

  async updateTestimonial(id: string, data: any) {
    return this.prisma.testimonial.update({
      where: { id },
      data,
    });
  }

  async deleteTestimonial(id: string) {
    return this.prisma.testimonial.delete({ where: { id } });
  }


  // ==========================================
  // 4. COMMENTS MODERATION WORKFLOW
  // ==========================================

  async addComment(
    customerId: string,
    data: {
      content: string;
      portfolioProjectId?: string;
      newsId?: string;
      articleId?: string;
    },
  ) {
    // Basic verification that at least one target is set
    if (!data.portfolioProjectId && !data.newsId && !data.articleId) {
      throw new BadRequestException('Comment must target a portfolio project, news, or article');
    }

    return this.prisma.comment.create({
      data: {
        customerId,
        content: data.content,
        portfolioProjectId: data.portfolioProjectId,
        newsId: data.newsId,
        articleId: data.articleId,
        status: 'APPROVED', // Immediately active; admin can still suspend/reject from dashboard
      },
      include: { customer: true },
    });
  }

  async findAllComments(params: {
    status?: CommentStatus;
    portfolioProjectId?: string;
    newsId?: string;
    articleId?: string;
  }) {
    const { status, portfolioProjectId, newsId, articleId } = params;
    const where: any = {};

    if (status) where.status = status;
    if (portfolioProjectId) where.portfolioProjectId = portfolioProjectId;
    if (newsId) where.newsId = newsId;
    if (articleId) where.articleId = articleId;

    return this.prisma.comment.findMany({
      where,
      include: {
        customer: true,
        article: { select: { id: true, titleAr: true, titleEn: true } },
        news: { select: { id: true, titleAr: true, titleEn: true } },
        portfolioProject: { select: { id: true, titleAr: true, titleEn: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async moderateComment(commentId: string, status: CommentStatus) {
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { status },
    });
  }

  async deleteComment(id: string) {
    return this.prisma.comment.delete({ where: { id } });
  }


  // ==========================================
  // 5. CLIENT RATINGS (UNIQUE CHECKS)
  // ==========================================

  async rateEntity(
    customerId: string,
    value: number,
    data: {
      portfolioProjectId?: string;
      serviceId?: string;
    },
  ) {
    if (value < 1 || value > 5) {
      throw new BadRequestException('Rating value must be between 1 and 5');
    }

    if (!data.portfolioProjectId && !data.serviceId) {
      throw new BadRequestException('Rating must target a portfolio project or a service');
    }

    if (data.portfolioProjectId) {
      // Upsert unique rating per user per portfolio project
      return this.prisma.rating.upsert({
        where: {
          customerId_portfolioProjectId: {
            customerId,
            portfolioProjectId: data.portfolioProjectId,
          },
        },
        update: { value },
        create: {
          customerId,
          portfolioProjectId: data.portfolioProjectId,
          value,
        },
      });
    }

    if (data.serviceId) {
      // Upsert unique rating per user per service
      return this.prisma.rating.upsert({
        where: {
          customerId_serviceId: {
            customerId,
            serviceId: data.serviceId,
          },
        },
        update: { value },
        create: {
          customerId,
          serviceId: data.serviceId,
          value,
        },
      });
    }
  }


  // ==========================================
  // 6. CLIENT LIKES (UNIQUE CHECKS)
  // ==========================================

  async likeEntity(
    customerId: string,
    data: {
      portfolioProjectId?: string;
      newsId?: string;
      articleId?: string;
    },
  ) {
    if (!data.portfolioProjectId && !data.newsId && !data.articleId) {
      throw new BadRequestException('Like must target a portfolio project, news, or article');
    }

    if (data.portfolioProjectId) {
      return this.prisma.like.upsert({
        where: {
          customerId_portfolioProjectId: {
            customerId,
            portfolioProjectId: data.portfolioProjectId,
          },
        },
        update: {},
        create: {
          customerId,
          portfolioProjectId: data.portfolioProjectId,
        },
      });
    }

    if (data.newsId) {
      return this.prisma.like.upsert({
        where: {
          customerId_newsId: {
            customerId,
            newsId: data.newsId,
          },
        },
        update: {},
        create: {
          customerId,
          newsId: data.newsId,
        },
      });
    }

    if (data.articleId) {
      return this.prisma.like.upsert({
        where: {
          customerId_articleId: {
            customerId,
            articleId: data.articleId,
          },
        },
        update: {},
        create: {
          customerId,
          articleId: data.articleId,
        },
      });
    }
  }

  async unlikeEntity(
    customerId: string,
    data: {
      portfolioProjectId?: string;
      newsId?: string;
      articleId?: string;
    },
  ) {
    if (!data.portfolioProjectId && !data.newsId && !data.articleId) {
      throw new BadRequestException('Unlike must target a portfolio project, news, or article');
    }

    if (data.portfolioProjectId) {
      return this.prisma.like.delete({
        where: {
          customerId_portfolioProjectId: {
            customerId,
            portfolioProjectId: data.portfolioProjectId,
          },
        },
      });
    }

    if (data.newsId) {
      return this.prisma.like.delete({
        where: {
          customerId_newsId: {
            customerId,
            newsId: data.newsId,
          },
        },
      });
    }

    if (data.articleId) {
      return this.prisma.like.delete({
        where: {
          customerId_articleId: {
            customerId,
            articleId: data.articleId,
          },
        },
      });
    }
  }

  async getDevTeam() {
    return this.prisma.devTeamMember.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }
}
