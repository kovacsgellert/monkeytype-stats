using Microsoft.EntityFrameworkCore;

namespace MonkeyTypeStats.Api.Data;

public class MonkeyTypeStatsDbContext : DbContext
{
    public MonkeyTypeStatsDbContext(DbContextOptions<MonkeyTypeStatsDbContext> options)
        : base(options) { }

    public DbSet<MonkeyTypeApiResponseLog> MonkeyTypeApiResponseLog =>
        Set<MonkeyTypeApiResponseLog>();

    public DbSet<Result> Results => Set<Result>();

    public DbSet<ResultDetail> ResultDetails => Set<ResultDetail>();

    public DbSet<ProfileSnapshot> ProfileSnapshots => Set<ProfileSnapshot>();

    public DbSet<LeaderboardSnapshot> LeaderboardSnapshots => Set<LeaderboardSnapshot>();

    public DbSet<SpeedHistogramSnapshot> SpeedHistogramSnapshots => Set<SpeedHistogramSnapshot>();

    public DbSet<PersonalBest> PersonalBests => Set<PersonalBest>();

    public DbSet<Tag> Tags => Set<Tag>();

    public DbSet<SavedView> SavedViews => Set<SavedView>();

    public DbSet<Goal> Goals => Set<Goal>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MonkeyTypeApiResponseLog>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.Timestamp).IsRequired();

            entity.Property(e => e.Endpoint).IsRequired().HasMaxLength(100);

            entity.Property(e => e.Data).IsRequired().HasColumnType("jsonb");
        });

        modelBuilder.Entity<Result>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasMaxLength(50);

            entity.Property(e => e.Mode).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Mode2).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Uid).IsRequired().HasMaxLength(100);

            entity.Property(e => e.Language).HasMaxLength(50);

            entity.Property(e => e.Difficulty).HasMaxLength(50);

            entity.Property(e => e.CharStats).HasColumnType("integer[]");

            entity.Property(e => e.Tags).HasColumnType("text[]");

            entity.Property(e => e.Funbox).HasColumnType("text[]");
        });

        modelBuilder.Entity<ResultDetail>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasMaxLength(50);

            entity.Property(e => e.Mode).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Mode2).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Uid).IsRequired().HasMaxLength(100);

            entity.Property(e => e.Language).HasMaxLength(50);

            entity.Property(e => e.Difficulty).HasMaxLength(50);

            entity.Property(e => e.Name).HasMaxLength(200);

            entity.Property(e => e.CharStats).HasColumnType("integer[]");

            entity.Property(e => e.Tags).HasColumnType("text[]");

            entity.Property(e => e.Funbox).HasColumnType("text[]");

            entity.Property(e => e.ChartWpm).HasColumnType("double precision[]");

            entity.Property(e => e.ChartBurst).HasColumnType("double precision[]");

            entity.Property(e => e.ChartErr).HasColumnType("double precision[]");
        });

        modelBuilder.Entity<ProfileSnapshot>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasIndex(e => e.CapturedAt);
        });

        modelBuilder.Entity<LeaderboardSnapshot>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Language).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Mode).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Mode2).IsRequired().HasMaxLength(50);

            entity.HasIndex(e => new
            {
                e.Language,
                e.Mode,
                e.Mode2,
                e.CapturedAt,
            });
        });

        modelBuilder.Entity<SpeedHistogramSnapshot>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Language).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Mode).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Mode2).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Buckets).IsRequired().HasColumnType("jsonb");

            entity.HasIndex(e => new
            {
                e.Language,
                e.Mode,
                e.Mode2,
                e.CapturedAt,
            });
        });

        modelBuilder.Entity<PersonalBest>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Mode).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Mode2).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Language).HasMaxLength(50);

            entity.Property(e => e.Difficulty).HasMaxLength(50);
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasMaxLength(50);

            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<SavedView>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);

            entity.Property(e => e.Filter).IsRequired().HasColumnType("jsonb");
        });

        modelBuilder.Entity<Goal>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);

            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);

            entity.Property(e => e.Filter).HasColumnType("jsonb");
        });
    }
}
