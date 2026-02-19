import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import slugify from 'slugify';
import { Artist } from './entities/artist.entity';
import { Genre } from './entities/genre.entity';
import { ArtistMedia } from './entities/artist-media.entity';
import { Booking } from '@/modules/bookings/entities/booking.entity';
import { Presskit } from '@/modules/presskits/entities/presskit.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { FilterArtistsDto } from './dto/filter-artists.dto';
import { InvitationsService } from '@/modules/invitations/invitations.service';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepo: Repository<Artist>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
    @InjectRepository(ArtistMedia)
    private readonly mediaRepo: Repository<ArtistMedia>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Presskit)
    private readonly presskitRepo: Repository<Presskit>,
    private readonly invitationsService: InvitationsService,
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

  async create(dto: CreateArtistDto, createdById?: string, inviterName = 'Sauroraa Admin'): Promise<Artist> {
    const {
      genreIds,
      media,
      createPresskit,
      presskitTitle,
      presskitTemplate,
      presskitSections,
      technicalRider,
      hospitalityRider,
      stagePlotUrl,
      inputListUrl,
      accountEmail,
      ...artistPayload
    } = dto;

    const slug = slugify(dto.name, { lower: true, strict: true });
    const artist = this.artistRepo.create({ ...artistPayload, slug });

    if (genreIds?.length) {
      artist.genres = await this.genreRepo.findBy({ id: In(genreIds) });
    }

    const savedArtist = await this.artistRepo.save(artist);

    if (Array.isArray(media) && media.length) {
      const mediaRows = media
        .filter((item) => item?.url && item?.type)
        .map((item, index) =>
          this.mediaRepo.create({
            artistId: savedArtist.id,
            type: item.type,
            url: item.url,
            thumbnailUrl: item.thumbnailUrl || null,
            title: item.title || null,
            sortOrder: item.sortOrder ?? index,
          }),
        );

      if (mediaRows.length) {
        await this.mediaRepo.save(mediaRows);
      }
    }

    if ((createPresskit ?? true) && createdById) {
      const defaultSections: any[] = [];

      if (savedArtist.bioFull || savedArtist.bioShort) {
        defaultSections.push({
          type: 'biography',
          title: 'Biography',
          content: savedArtist.bioFull || savedArtist.bioShort,
          visible: true,
        });
      }

      const imageUrls = (media || []).filter((m) => m.type === 'image').map((m) => m.url);
      if (imageUrls.length) {
        defaultSections.push({
          type: 'gallery',
          title: 'Photos',
          content: imageUrls.join('\n'),
          visible: true,
        });
      }

      const videoUrls = (media || []).filter((m) => m.type === 'video').map((m) => m.url);
      if (videoUrls.length) {
        defaultSections.push({
          type: 'videos',
          title: 'Videos',
          content: videoUrls.join('\n'),
          visible: true,
        });
      }

      if (technicalRider) {
        defaultSections.push({
          type: 'technical',
          title: 'Technical Rider',
          content: technicalRider,
          visible: true,
        });
      }

      if (hospitalityRider) {
        defaultSections.push({
          type: 'custom',
          title: 'Hospitality Rider',
          content: hospitalityRider,
          visible: true,
        });
      }

      if (stagePlotUrl) {
        defaultSections.push({
          type: 'custom',
          title: 'Stage Plot',
          content: stagePlotUrl,
          visible: true,
        });
      }

      if (inputListUrl) {
        defaultSections.push({
          type: 'custom',
          title: 'Input List',
          content: inputListUrl,
          visible: true,
        });
      }

      const sections = Array.isArray(presskitSections) && presskitSections.length
        ? presskitSections
        : defaultSections;

      await this.presskitRepo.save(
        this.presskitRepo.create({
          artistId: savedArtist.id,
          createdById,
          title: presskitTitle || `${savedArtist.name} - Presskit`,
          template: presskitTemplate || 'event',
          sections,
          isEventReady: false,
          status: 'draft',
        }),
      );
    }

    if (accountEmail && createdById) {
      await this.invitationsService.create(accountEmail, 'promoter', createdById, inviterName);
    }

    return this.findById(savedArtist.id);
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

  async getPublicStats() {
    const totalArtists = await this.artistRepo.count({
      where: { isConfidential: false },
    });

    const eventsBooked = await this.bookingRepo
      .createQueryBuilder('booking')
      .innerJoin('booking.artist', 'artist')
      .where('artist.isConfidential = :conf', { conf: false })
      .andWhere('booking.status = :status', { status: 'confirmed' })
      .getCount();

    const artistCountryRows = await this.artistRepo
      .createQueryBuilder('artist')
      .select('DISTINCT artist.country', 'country')
      .where('artist.isConfidential = :conf', { conf: false })
      .andWhere("artist.country IS NOT NULL AND artist.country != ''")
      .getRawMany<{ country: string }>();

    const bookingCountryRows = await this.bookingRepo
      .createQueryBuilder('booking')
      .innerJoin('booking.artist', 'artist')
      .select('DISTINCT booking.eventCountry', 'country')
      .where('artist.isConfidential = :conf', { conf: false })
      .andWhere('booking.status = :status', { status: 'confirmed' })
      .andWhere("booking.eventCountry IS NOT NULL AND booking.eventCountry != ''")
      .getRawMany<{ country: string }>();

    const countrySet = new Set<string>();
    for (const row of artistCountryRows) countrySet.add(row.country);
    for (const row of bookingCountryRows) countrySet.add(row.country);

    const oldestArtist = await this.artistRepo
      .createQueryBuilder('artist')
      .select('MIN(artist.createdAt)', 'minDate')
      .where('artist.isConfidential = :conf', { conf: false })
      .getRawOne<{ minDate: string | null }>();

    const oldestBooking = await this.bookingRepo
      .createQueryBuilder('booking')
      .innerJoin('booking.artist', 'artist')
      .select('MIN(booking.createdAt)', 'minDate')
      .where('artist.isConfidential = :conf', { conf: false })
      .andWhere('booking.status = :status', { status: 'confirmed' })
      .getRawOne<{ minDate: string | null }>();

    const candidateDates = [oldestArtist?.minDate, oldestBooking?.minDate]
      .filter((d): d is string => Boolean(d))
      .map((d) => new Date(d))
      .filter((d) => !Number.isNaN(d.getTime()));

    let yearsActive = 0;
    if (candidateDates.length > 0) {
      const oldestDate = new Date(Math.min(...candidateDates.map((d) => d.getTime())));
      const yearMs = 365.25 * 24 * 60 * 60 * 1000;
      yearsActive = Math.max(1, Math.floor((Date.now() - oldestDate.getTime()) / yearMs));
    }

    return {
      artists: totalArtists,
      eventsBooked,
      countries: countrySet.size,
      yearsActive: 1,
      artistCountries: artistCountryRows.length,
      bookingCountries: bookingCountryRows.length,
    };
  }
}
