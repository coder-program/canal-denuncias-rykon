import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintsService } from './complaints.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import { LoggerService } from '@shared/logger/logger.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { QueryComplaintsDto } from './dto/query-complaints.dto';
import { ComplaintType, ComplaintPriority, ComplaintStatus, UserRole } from '@prisma/client';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ComplaintsService', () => {
  let service: ComplaintsService;
  let prismaService: PrismaService;
  let loggerService: LoggerService;

  const mockPrismaService = {
    complaint: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
    complaintStatusHistory: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    systemSetting: {
      findUnique: jest.fn(),
    },
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<ComplaintsService>(ComplaintsService);
    prismaService = module.get<PrismaService>(PrismaService);
    loggerService = module.get<LoggerService>(LoggerService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateComplaintDto = {
      isAnonymous: false,
      reporterEmail: 'reporter@example.com',
      reporterPhone: '+5511999999999',
      type: ComplaintType.HARASSMENT,
      priority: ComplaintPriority.HIGH,
      title: 'Assédio moral no departamento de vendas',
      description:
        'Durante o mês de outubro, presenciei repetidas situações de assédio moral pelo gestor da equipe...',
      location: 'Escritório - 3º andar, sala 305',
      incidentDate: '2024-10-01T14:30:00Z',
      involvedPeople: ['João Silva', 'maria@empresa.com'],
      witnesses: ['Pedro Santos'],
      metadata: { department: 'Vendas' },
    };

    const mockComplaint = {
      id: 'complaint-123',
      protocol: 'DEN-2024-ABC123',
      ...createDto,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: {
        id: 'user-123',
        email: 'user@example.com',
        fullName: 'User Test',
        role: UserRole.REPORTER,
      },
    };

    it('should create a new complaint successfully', async () => {
      mockPrismaService.complaint.create.mockResolvedValue(mockComplaint);
      mockPrismaService.complaintStatusHistory.create.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.systemSetting.findUnique.mockResolvedValue({ value: 'false' });

      const result = await service.create(createDto, 'user-123');

      expect(result).toBeDefined();
      expect(result.protocol).toMatch(/^DEN-\d{4}-[A-Z0-9]{6}$/);
      expect(mockPrismaService.complaint.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: createDto.title,
            type: createDto.type,
            priority: createDto.priority,
            status: 'PENDING',
          }),
          include: expect.any(Object),
        }),
      );
      expect(mockPrismaService.complaintStatusHistory.create).toHaveBeenCalled();
      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
      expect(mockLoggerService.log).toHaveBeenCalled();
    });

    it('should create anonymous complaint without creator', async () => {
      const anonDto = { ...createDto, isAnonymous: true };
      const anonComplaint = { ...mockComplaint, isAnonymous: true, createdBy: null };

      mockPrismaService.complaint.create.mockResolvedValue(anonComplaint);
      mockPrismaService.complaintStatusHistory.create.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.systemSetting.findUnique.mockResolvedValue({ value: 'false' });

      const result = await service.create(anonDto);

      expect(result).toBeDefined();
      expect(result.isAnonymous).toBe(true);
      expect(mockPrismaService.complaint.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isAnonymous: true,
            createdBy: null,
          }),
        }),
      );
    });

    it('should auto-block involved users when enabled', async () => {
      mockPrismaService.complaint.create.mockResolvedValue(mockComplaint);
      mockPrismaService.complaintStatusHistory.create.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});
      mockPrismaService.user.findMany
        .mockResolvedValueOnce([]) // notifyNewComplaint
        .mockResolvedValueOnce([
          // autoBlockInvolvedUsers
          { id: 'user-456', email: 'maria@empresa.com', isBlocked: false },
        ]);
      mockPrismaService.systemSetting.findUnique.mockResolvedValue({ value: 'true' });
      mockPrismaService.user.update.mockResolvedValue({});

      await service.create(createDto, 'user-123');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-456' },
          data: expect.objectContaining({
            isBlocked: true,
            blockedReason: expect.stringContaining('Citado em denúncia'),
          }),
        }),
      );
      expect(mockLoggerService.warn).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const query: QueryComplaintsDto = {
      page: 1,
      limit: 20,
    };

    const mockComplaints = [
      {
        id: 'complaint-1',
        protocol: 'DEN-2024-ABC123',
        status: 'PENDING',
        type: 'HARASSMENT',
        title: 'Complaint 1',
        creator: { id: 'user-1', email: 'user1@example.com', fullName: 'User 1', role: 'REPORTER' },
        investigator: null,
        _count: { attachments: 0, statusHistory: 1 },
      },
    ];

    it('should return paginated complaints for ADMIN', async () => {
      mockPrismaService.complaint.findMany.mockResolvedValue(mockComplaints);
      mockPrismaService.complaint.count.mockResolvedValue(45);

      const result = await service.findAll(query, UserRole.ADMIN);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 45,
        totalPages: 3,
      });
    });

    it('should filter complaints by status', async () => {
      const queryWithStatus = { ...query, status: ComplaintStatus.PENDING };
      mockPrismaService.complaint.findMany.mockResolvedValue(mockComplaints);
      mockPrismaService.complaint.count.mockResolvedValue(10);

      await service.findAll(queryWithStatus, UserRole.ADMIN);

      expect(mockPrismaService.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ComplaintStatus.PENDING,
          }),
        }),
      );
    });

    it('should only show REPORTER their own complaints', async () => {
      mockPrismaService.complaint.findMany.mockResolvedValue([mockComplaints[0]]);
      mockPrismaService.complaint.count.mockResolvedValue(5);

      await service.findAll(query, UserRole.REPORTER, 'user-1');

      expect(mockPrismaService.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdBy: 'user-1',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    const mockComplaint = {
      id: 'complaint-123',
      protocol: 'DEN-2024-ABC123',
      status: 'PENDING',
      type: 'HARASSMENT',
      title: 'Complaint 1',
      createdBy: 'user-123',
      creator: { id: 'user-123', email: 'user@example.com', fullName: 'User', role: 'REPORTER' },
      investigator: null,
      attachments: [],
      statusHistory: [],
      dossiers: [],
    };

    it('should return complaint by id for ADMIN', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.findOne('complaint-123', UserRole.ADMIN);

      expect(result).toBeDefined();
      expect(result.id).toBe('complaint-123');
      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if complaint not found', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', UserRole.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if REPORTER tries to view others complaint', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);

      await expect(
        service.findOne('complaint-123', UserRole.REPORTER, 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow REPORTER to view own complaint', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.findOne('complaint-123', UserRole.REPORTER, 'user-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('complaint-123');
    });
  });

  describe('findByProtocol', () => {
    it('should return complaint status by protocol', async () => {
      const mockResponse = {
        id: 'complaint-123',
        protocol: 'DEN-2024-ABC123',
        status: 'PENDING',
        type: 'HARASSMENT',
        priority: 'MEDIUM',
        title: 'Complaint 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
        isAnonymous: false,
      };

      mockPrismaService.complaint.findUnique.mockResolvedValue(mockResponse);

      const result = await service.findByProtocol('DEN-2024-ABC123');

      expect(result).toBeDefined();
      expect(result.protocol).toBe('DEN-2024-ABC123');
    });

    it('should throw NotFoundException if protocol not found', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(null);

      await expect(service.findByProtocol('INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('changeStatus', () => {
    const mockComplaint = {
      id: 'complaint-123',
      protocol: 'DEN-2024-ABC123',
      status: 'PENDING',
      isAnonymous: false,
      createdBy: 'user-123',
    };

    it('should change complaint status successfully', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);
      mockPrismaService.complaint.update.mockResolvedValue({
        ...mockComplaint,
        status: 'IN_PROGRESS',
      });
      mockPrismaService.complaintStatusHistory.create.mockResolvedValue({});
      mockPrismaService.notification.create.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.changeStatus(
        'complaint-123',
        ComplaintStatus.IN_PROGRESS,
        'Investigação iniciada',
        'admin-456',
      );

      expect(result.status).toBe('IN_PROGRESS');
      expect(mockPrismaService.complaintStatusHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            previousStatus: 'PENDING',
            newStatus: 'IN_PROGRESS',
            reason: 'Investigação iniciada',
          }),
        }),
      );
      expect(mockLoggerService.log).toHaveBeenCalled();
    });

    it('should set resolvedAt when status is RESOLVED', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);
      mockPrismaService.complaint.update.mockResolvedValue({
        ...mockComplaint,
        status: 'RESOLVED',
        resolvedAt: new Date(),
      });
      mockPrismaService.complaintStatusHistory.create.mockResolvedValue({});
      mockPrismaService.notification.create.mockResolvedValue({});
      mockPrismaService.auditLog.create.mockResolvedValue({});

      await service.changeStatus(
        'complaint-123',
        ComplaintStatus.RESOLVED,
        'Caso resolvido',
        'admin-456',
      );

      expect(mockPrismaService.complaint.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'RESOLVED',
            resolvedAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('getStats', () => {
    it('should return complaint statistics', async () => {
      mockPrismaService.complaint.count
        .mockResolvedValueOnce(150) // total
        .mockResolvedValueOnce(25) // pending
        .mockResolvedValueOnce(40) // inProgress
        .mockResolvedValueOnce(85); // resolved

      mockPrismaService.complaint.groupBy
        .mockResolvedValueOnce([
          // byType
          { type: 'HARASSMENT', _count: 35 },
          { type: 'DISCRIMINATION', _count: 20 },
        ])
        .mockResolvedValueOnce([
          // byPriority
          { priority: 'LOW', _count: 40 },
          { priority: 'MEDIUM', _count: 70 },
        ]);

      const result = await service.getStats();

      expect(result).toEqual({
        total: 150,
        byStatus: {
          pending: 25,
          inProgress: 40,
          resolved: 85,
        },
        byType: {
          HARASSMENT: 35,
          DISCRIMINATION: 20,
        },
        byPriority: {
          LOW: 40,
          MEDIUM: 70,
        },
      });
    });
  });
});
