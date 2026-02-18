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
    }
}
