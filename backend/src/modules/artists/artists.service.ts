import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import slugify from 'slugify';
import { Artist } from './entities/artist.entity';
import { Genre } from './entities/genre.entity';
import { ArtistMedia } from './entities/artist-media.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { FilterArtistsDto } from './dto/filter-artists.dto';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepo: Repository<Artist>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
    @InjectRepository(ArtistMedia)
    private readonly mediaRepo: Repository<ArtistMedia>,
  ) {}

  async findAllPublic(filters: FilterArtistsDto) {
    const qb = this.artistRepo.createQueryBuilder('artist')
      .leftJoinAndSelect('artist.genres', 'genre')
      .leftJoinAndSelect('artist.media', 'media')
      .where('artist.isConfidential = :conf', { conf: false });

    if (filters.genre) {
      qb.andWhere('genre.slug = :genre', { genre: filters.genre });
    }
    if (filters.country) {
      qb.andWhere('artist.country = :country', { country: filters.country });
    }
    if (filters.availability) {
      qb.andWhere('artist.availability = :availability', { availability: filters.availability });
    }
    if (filters.search) {
      qb.andWhere('(artist.name LIKE :search OR artist.bioShort LIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    switch (filters.sortBy) {
      case 'name':
        qb.orderBy('artist.name', 'ASC');
        break;
      case 'newest':
        qb.orderBy('artist.createdAt', 'DESC');
        break;
      default:
        qb.orderBy('artist.popularityScore', 'DESC');
    }

    const [items, total] = await qb
      .skip(filters.skip)
      .take(filters.limit)
      .getManyAndCount();

    return { items, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / (filters.limit || 20)) };
  }

  async findBySlug(slug: string): Promise<Artist> {
    const artist = await this.artistRepo.findOne({
      where: { slug, isConfidential: false },
      relations: ['genres', 'media', 'manager'],
    });
    if (!artist) throw new NotFoundException('Artist not found');
    return artist;
  }

  async findCurated() {
    return this.artistRepo.find({
      where: { isCurated: true, isConfidential: false },
      relations: ['genres', 'media'],
      order: { popularityScore: 'DESC' },
    });
  }

  async findAll(filters: FilterArtistsDto) {
    const qb = this.artistRepo.createQueryBuilder('artist')
      .leftJoinAndSelect('artist.genres', 'genre')
      .leftJoinAndSelect('artist.media', 'media')
      .leftJoinAndSelect('artist.manager', 'manager');

    if (filters.search) {
      qb.andWhere('(artist.name LIKE :search OR artist.realName LIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    const [items, total] = await qb
      .orderBy('artist.createdAt', 'DESC')
      .skip(filters.skip)
      .take(filters.limit)
      .getManyAndCount();

    return { items, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / (filters.limit || 20)) };
  }

  async findById(id: string): Promise<Artist> {
    const artist = await this.artistRepo.findOne({
      where: { id },
      relations: ['genres', 'media', 'manager'],
    });
    if (!artist) throw new NotFoundException('Artist not found');
    return artist;
  }

  async create(dto: CreateArtistDto): Promise<Artist> {
    const slug = slugify(dto.name, { lower: true, strict: true });
    const artist = this.artistRepo.create({ ...dto, slug });

    if (dto.genreIds?.length) {
      artist.genres = await this.genreRepo.findBy({ id: In(dto.genreIds) });
    }

    return this.artistRepo.save(artist);
  }

  async update(id: string, dto: Partial<CreateArtistDto>): Promise<Artist> {
    const artist = await this.findById(id);
    Object.assign(artist, dto);

    if (dto.name) {
      artist.slug = slugify(dto.name, { lower: true, strict: true });
    }
    if (dto.genreIds) {
      artist.genres = await this.genreRepo.findBy({ id: In(dto.genreIds) });
    }

    return this.artistRepo.save(artist);
  }

  async delete(id: string): Promise<void> {
    const artist = await this.findById(id);
    await this.artistRepo.remove(artist);
  }

  async toggleConfidential(id: string): Promise<Artist> {
    const artist = await this.findById(id);
    artist.isConfidential = !artist.isConfidential;
    return this.artistRepo.save(artist);
  }

  async findSimilar(id: string, limit = 5): Promise<Artist[]> {
    const artist = await this.findById(id);
    const genreIds = artist.genres.map((g) => g.id);

    if (!genreIds.length) return [];

    return this.artistRepo.createQueryBuilder('artist')
      .leftJoinAndSelect('artist.genres', 'genre')
      .where('artist.id != :id', { id })
      .andWhere('genre.id IN (:...genreIds)', { genreIds })
      .andWhere('artist.isConfidential = false')
      .orderBy('artist.popularityScore', 'DESC')
      .take(limit)
      .getMany();
  }

  async getAllGenres(): Promise<Genre[]> {
    return this.genreRepo.find({ order: { name: 'ASC' } });
  }
}
