# RAB Import & Tampil — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun fitur import file Excel RAB mingguan → simpan terstruktur → tampil read-only di web, sekaligus memuat 3 file acuan sebagai data contoh.

**Architecture:** Backend NestJS (`mbg-new`) menambah modul `rab` dengan 4 entitas, parser ExcelJS, endpoint REST, dan integrasi seed. Frontend React/Vite (`mbg-web`) menambah halaman daftar + detail dan menu sidebar. Data import disimpan sebagai snapshot mandiri (tidak terhubung master data) di increment ini.

**Tech Stack:** NestJS, TypeORM, PostgreSQL, ExcelJS, Jest (backend); React 19, Vite, TanStack Query, Tailwind, axios (frontend).

**Repos:** Tugas 1–7 di `/home/wanda/mbg-new` (backend). Tugas 8–13 di `/home/wanda/mbg-web` (frontend). Spec acuan: `mbg-web/docs/superpowers/specs/2026-06-12-rab-import-tampil-design.md`.

**Prasyarat lingkungan:** Postgres container `mbg-postgres` menyala (`docker start mbg-postgres`), backend bisa `npm run` dari `/home/wanda/mbg-new`, frontend dari `/home/wanda/mbg-web`. File acuan ada di `/home/wanda/mbg-new/docs/`.

---

## File Structure

**Backend (`mbg-new`):**
- Create: `src/modules/rab/entities/rab-mingguan.entity.ts` — entitas induk (1 file = 1 baris)
- Create: `src/modules/rab/entities/rab-hari.entity.ts` — entitas per hari/B3 + enum `JenisRabHari`
- Create: `src/modules/rab/entities/rab-penerima.entity.ts` — baris penerima manfaat
- Create: `src/modules/rab/entities/rab-bahan.entity.ts` — baris bahan baku
- Create: `src/database/migrations/1786000000000-CreateRab.ts` — buat 4 tabel
- Create: `src/modules/rab/rab-parser.service.ts` — Excel(Buffer) → objek terstruktur
- Create: `src/modules/rab/rab-parser.service.spec.ts` — unit test parser (pakai 3 file asli)
- Create: `src/modules/rab/dto/query-rab.dto.ts` — query pagination
- Create: `src/modules/rab/rab.service.ts` — simpan (transaksi), list, detail, hapus
- Create: `src/modules/rab/rab.controller.ts` — endpoint REST + upload
- Create: `src/modules/rab/rab.module.ts` — wiring modul
- Modify: `src/app.module.ts` — daftarkan `RabModule`
- Modify: `src/database/seed.ts` — muat 3 file acuan sebagai data contoh

**Frontend (`mbg-web`):**
- Modify: `src/types/index.ts` — tambah tipe `Rab*`
- Create: `src/api/endpoints/rab.ts` — list, detail, import, delete
- Create: `src/pages/rab/RabListPage.tsx` — daftar + tombol Import Excel
- Create: `src/pages/rab/RabDetailPage.tsx` — tampilan read-only
- Modify: `src/App.tsx` — route `/rab` dan `/rab/:id`
- Modify: `src/components/Layout.tsx` — menu "RAB Mingguan"

---

## Task 1: Entitas RAB (backend)

**Files:**
- Create: `src/modules/rab/entities/rab-mingguan.entity.ts`
- Create: `src/modules/rab/entities/rab-hari.entity.ts`
- Create: `src/modules/rab/entities/rab-penerima.entity.ts`
- Create: `src/modules/rab/entities/rab-bahan.entity.ts`

Mengikuti pola `src/modules/keuangan/entities/keuangan.entity.ts` (ColumnNumericTransformer untuk kolom numeric, soft-delete, sppg_id).

- [ ] **Step 1: Buat `rab-mingguan.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../common/transformers/numeric.transformer';
import { RabHari } from './rab-hari.entity';

@Entity('rab_mingguan')
export class RabMingguan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  label: string;

  @Column({
    name: 'total_anggaran',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  totalAnggaran: number;

  @Column({
    name: 'penggunaan_anggaran',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  penggunaanAnggaran: number;

  @Column({
    name: 'sisa_anggaran',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  sisaAnggaran: number;

  @Column({ name: 'sumber_file', length: 255 })
  sumberFile: string;

  @Column({ name: 'sppg_id', type: 'uuid' })
  sppgId: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdById: string | null;

  @Column({ name: 'imported_at', type: 'timestamptz' })
  importedAt: Date;

  @OneToMany(() => RabHari, (h) => h.rabMingguan, { cascade: true })
  hari: RabHari[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
```

- [ ] **Step 2: Buat `rab-hari.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../common/transformers/numeric.transformer';
import { RabMingguan } from './rab-mingguan.entity';
import { RabPenerima } from './rab-penerima.entity';
import { RabBahan } from './rab-bahan.entity';

export enum JenisRabHari {
  HARIAN = 'HARIAN',
  B3 = 'B3',
}

@Entity('rab_hari')
export class RabHari {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nama_hari', length: 20 })
  namaHari: string;

  @Column({ type: 'enum', enum: JenisRabHari, default: JenisRabHari.HARIAN })
  jenis: JenisRabHari;

  @Column({ type: 'text', nullable: true })
  menu: string | null;

  @Column({
    name: 'total_bahan_baku',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  totalBahanBaku: number;

  @Column({
    name: 'sisa_anggaran',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  sisaAnggaran: number;

  @Column({ name: 'urutan', type: 'int', default: 0 })
  urutan: number;

  @ManyToOne(() => RabMingguan, (m) => m.hari, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rab_mingguan_id' })
  rabMingguan: RabMingguan;

  @Column({ name: 'rab_mingguan_id', type: 'uuid' })
  rabMingguanId: string;

  @OneToMany(() => RabPenerima, (p) => p.rabHari, { cascade: true })
  penerima: RabPenerima[];

  @OneToMany(() => RabBahan, (b) => b.rabHari, { cascade: true })
  bahan: RabBahan[];
}
```

- [ ] **Step 3: Buat `rab-penerima.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../common/transformers/numeric.transformer';
import { RabHari } from './rab-hari.entity';

@Entity('rab_penerima')
export class RabPenerima {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  kategori: string;

  @Column({ name: 'jumlah_porsi', type: 'int' })
  jumlahPorsi: number;

  @Column({
    name: 'harga_per_porsi',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  hargaPerPorsi: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  subtotal: number;

  @ManyToOne(() => RabHari, (h) => h.penerima, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rab_hari_id' })
  rabHari: RabHari;

  @Column({ name: 'rab_hari_id', type: 'uuid' })
  rabHariId: string;
}
```

- [ ] **Step 4: Buat `rab-bahan.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../common/transformers/numeric.transformer';
import { RabHari } from './rab-hari.entity';

@Entity('rab_bahan')
export class RabBahan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, nullable: true })
  ctg: string | null;

  @Column({ length: 200 })
  item: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 3,
    transformer: new ColumnNumericTransformer(),
  })
  qty: number;

  @Column({ length: 30 })
  satuan: string;

  @Column({
    name: 'harga_satuan',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  hargaSatuan: number;

  @Column({
    name: 'total_hs',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  totalHs: number;

  @Column({ name: 'urutan', type: 'int', default: 0 })
  urutan: number;

  @ManyToOne(() => RabHari, (h) => h.bahan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rab_hari_id' })
  rabHari: RabHari;

  @Column({ name: 'rab_hari_id', type: 'uuid' })
  rabHariId: string;
}
```

- [ ] **Step 5: Verifikasi kompilasi TypeScript**

Run: `cd /home/wanda/mbg-new && npx tsc --noEmit -p tsconfig.json`
Expected: tidak ada error terkait file `src/modules/rab/entities/*`.

- [ ] **Step 6: Commit**

```bash
cd /home/wanda/mbg-new
git add src/modules/rab/entities
git commit -m "feat(rab): entitas RAB mingguan, hari, penerima, bahan"
```

---

## Task 2: Migrasi 4 tabel (backend)

**Files:**
- Create: `src/database/migrations/1786000000000-CreateRab.ts`

Mengikuti pola `src/database/migrations/1783800000000-CreateCekMutuPenerimaan.ts` (CREATE TABLE + FK + index).

- [ ] **Step 1: Buat file migrasi**

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

// Increment 1 RAB: import & tampil RAB mingguan (snapshot dari file Excel).
export class CreateRab1786000000000 implements MigrationInterface {
  name = 'CreateRab1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "rab_mingguan" (
        "id"                   uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "label"                varchar(200)  NOT NULL,
        "total_anggaran"       numeric(15,2) NOT NULL,
        "penggunaan_anggaran"  numeric(15,2) NOT NULL,
        "sisa_anggaran"        numeric(15,2) NOT NULL,
        "sumber_file"          varchar(255)  NOT NULL,
        "sppg_id"              uuid          NOT NULL,
        "created_by"           uuid,
        "imported_at"          timestamptz   NOT NULL,
        "created_at"           TIMESTAMP     NOT NULL DEFAULT now(),
        "updated_at"           TIMESTAMP     NOT NULL DEFAULT now(),
        "deleted_at"           TIMESTAMP,
        CONSTRAINT "PK_rab_mingguan" PRIMARY KEY ("id"),
        CONSTRAINT "FK_rab_mingguan_creator"
          FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_rab_mingguan_sppg_id" ON "rab_mingguan" ("sppg_id")`,
    );

    await queryRunner.query(`
      CREATE TYPE "rab_hari_jenis_enum" AS ENUM ('HARIAN', 'B3')
    `);
    await queryRunner.query(`
      CREATE TABLE "rab_hari" (
        "id"                uuid                  NOT NULL DEFAULT uuid_generate_v4(),
        "rab_mingguan_id"   uuid                  NOT NULL,
        "nama_hari"         varchar(20)           NOT NULL,
        "jenis"             "rab_hari_jenis_enum" NOT NULL DEFAULT 'HARIAN',
        "menu"              text,
        "total_bahan_baku"  numeric(15,2)         NOT NULL DEFAULT 0,
        "sisa_anggaran"     numeric(15,2)         NOT NULL DEFAULT 0,
        "urutan"            int                   NOT NULL DEFAULT 0,
        CONSTRAINT "PK_rab_hari" PRIMARY KEY ("id"),
        CONSTRAINT "FK_rab_hari_mingguan"
          FOREIGN KEY ("rab_mingguan_id") REFERENCES "rab_mingguan"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_rab_hari_mingguan_id" ON "rab_hari" ("rab_mingguan_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "rab_penerima" (
        "id"               uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "rab_hari_id"      uuid          NOT NULL,
        "kategori"         varchar(150)  NOT NULL,
        "jumlah_porsi"     int           NOT NULL,
        "harga_per_porsi"  numeric(15,2) NOT NULL,
        "subtotal"         numeric(15,2) NOT NULL,
        CONSTRAINT "PK_rab_penerima" PRIMARY KEY ("id"),
        CONSTRAINT "FK_rab_penerima_hari"
          FOREIGN KEY ("rab_hari_id") REFERENCES "rab_hari"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_rab_penerima_hari_id" ON "rab_penerima" ("rab_hari_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "rab_bahan" (
        "id"            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "rab_hari_id"   uuid          NOT NULL,
        "ctg"           varchar(50),
        "item"          varchar(200)  NOT NULL,
        "qty"           numeric(12,3) NOT NULL DEFAULT 0,
        "satuan"        varchar(30)   NOT NULL DEFAULT '',
        "harga_satuan"  numeric(15,2) NOT NULL DEFAULT 0,
        "total_hs"      numeric(15,2) NOT NULL DEFAULT 0,
        "urutan"        int           NOT NULL DEFAULT 0,
        CONSTRAINT "PK_rab_bahan" PRIMARY KEY ("id"),
        CONSTRAINT "FK_rab_bahan_hari"
          FOREIGN KEY ("rab_hari_id") REFERENCES "rab_hari"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_rab_bahan_hari_id" ON "rab_bahan" ("rab_hari_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_rab_bahan_hari_id"`);
    await queryRunner.query(`DROP TABLE "rab_bahan"`);
    await queryRunner.query(`DROP INDEX "IDX_rab_penerima_hari_id"`);
    await queryRunner.query(`DROP TABLE "rab_penerima"`);
    await queryRunner.query(`DROP INDEX "IDX_rab_hari_mingguan_id"`);
    await queryRunner.query(`DROP TABLE "rab_hari"`);
    await queryRunner.query(`DROP TYPE "rab_hari_jenis_enum"`);
    await queryRunner.query(`DROP INDEX "IDX_rab_mingguan_sppg_id"`);
    await queryRunner.query(`DROP TABLE "rab_mingguan"`);
  }
}
```

- [ ] **Step 2: Jalankan migrasi**

Run: `cd /home/wanda/mbg-new && npm run migration:run`
Expected: `Migration CreateRab1786000000000 has been executed successfully.`

- [ ] **Step 3: Verifikasi tabel ada**

Run: `docker exec mbg-postgres psql -U postgres -d mbg_db -c "\dt rab_*"`
Expected: `rab_mingguan`, `rab_hari`, `rab_penerima`, `rab_bahan` tampil.

- [ ] **Step 4: Commit**

```bash
cd /home/wanda/mbg-new
git add src/database/migrations/1786000000000-CreateRab.ts
git commit -m "feat(rab): migrasi tabel rab_mingguan/hari/penerima/bahan"
```

---

## Task 3: Parser Excel (TDD, backend)

**Files:**
- Create: `src/modules/rab/rab-parser.service.ts`
- Test: `src/modules/rab/rab-parser.service.spec.ts`

Parser menerima `Buffer` xlsx dan mengembalikan objek terstruktur (belum menyentuh DB). Logika berbasis pencarian label (bukan nomor baris tetap) agar tahan variasi. Sheet yang dipakai: nama mengandung `Future` (→ HARIAN), nama `B3` (→ B3), nama `anggaran` (ringkasan). Header tabel bahan dikenali dari sel kolom A bernilai `CTG`.

- [ ] **Step 1: Tulis test yang gagal**

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';
import { RabParserService } from './rab-parser.service';

const DOCS = join(process.cwd(), 'docs');
const buf = (name: string) => readFileSync(join(DOCS, name));

describe('RabParserService', () => {
  let parser: RabParserService;

  beforeEach(() => {
    parser = new RabParserService();
  });

  it('parse file RAB minggu 1 periode 1: ringkasan anggaran', async () => {
    const hasil = await parser.parse(buf('P1W1 - RAB minggu 1 periode 1.xlsx'));
    expect(hasil.totalAnggaran).toBe(17346000);
    expect(hasil.sisaAnggaran).toBe(27250);
    expect(hasil.penggunaanAnggaran).toBe(17318750);
  });

  it('parse hari Senin: penerima, menu, total bahan baku', async () => {
    const hasil = await parser.parse(buf('P1W1 - RAB minggu 1 periode 1.xlsx'));
    const senin = hasil.hari.find((h) => h.namaHari === 'Senin');
    expect(senin).toBeDefined();
    expect(senin!.jenis).toBe('HARIAN');
    expect(senin!.menu).toContain('Nasi putih');
    expect(senin!.totalBahanBaku).toBe(6215750);
    expect(senin!.sisaAnggaran).toBe(-433750);

    // penerima manfaat
    expect(senin!.penerima).toHaveLength(2);
    const paud = senin!.penerima.find((p) => p.kategori.includes('PAUD'));
    expect(paud!.jumlahPorsi).toBe(204);
    expect(paud!.hargaPerPorsi).toBe(8000);
    expect(paud!.subtotal).toBe(1632000);

    // bahan baku
    const beras = senin!.bahan.find((b) => b.item === 'Beras');
    expect(beras!.qty).toBe(44);
    expect(beras!.satuan).toBe('KG');
    expect(beras!.hargaSatuan).toBe(15500);
    expect(beras!.totalHs).toBe(682000);
  });

  it('menolak file tanpa sheet anggaran', async () => {
    // workbook kosong tanpa sheet anggaran
    const ExcelJS = await import('exceljs');
    const wb = new ExcelJS.Workbook();
    wb.addWorksheet('Sheet1');
    const bad = Buffer.from(await wb.xlsx.writeBuffer());
    await expect(parser.parse(bad)).rejects.toThrow(/format RAB/i);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `cd /home/wanda/mbg-new && npx jest src/modules/rab/rab-parser.service.spec.ts`
Expected: FAIL — `Cannot find module './rab-parser.service'`.

- [ ] **Step 3: Implementasi parser**

```typescript
import { BadRequestException, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface ParsedPenerima {
  kategori: string;
  jumlahPorsi: number;
  hargaPerPorsi: number;
  subtotal: number;
}

export interface ParsedBahan {
  ctg: string | null;
  item: string;
  qty: number;
  satuan: string;
  hargaSatuan: number;
  totalHs: number;
}

export interface ParsedHari {
  namaHari: string;
  jenis: 'HARIAN' | 'B3';
  menu: string | null;
  totalBahanBaku: number;
  sisaAnggaran: number;
  penerima: ParsedPenerima[];
  bahan: ParsedBahan[];
}

export interface ParsedRab {
  totalAnggaran: number;
  penggunaanAnggaran: number;
  sisaAnggaran: number;
  hari: ParsedHari[];
}

const HARI_MAP: Record<string, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu',
};

@Injectable()
export class RabParserService {
  async parse(buffer: Buffer): Promise<ParsedRab> {
    const wb = new ExcelJS.Workbook();
    try {
      await wb.xlsx.load(buffer);
    } catch {
      throw new BadRequestException(
        'File harus Excel (.xlsx) sesuai format RAB.',
      );
    }

    const anggaranWs = wb.worksheets.find(
      (w) => w.name.trim().toLowerCase() === 'anggaran',
    );
    if (!anggaranWs) {
      throw new BadRequestException(
        'File tidak sesuai format RAB: sheet "anggaran" tidak ditemukan.',
      );
    }
    const anggaran = this.parseAnggaran(anggaranWs);

    const hari: ParsedHari[] = [];
    for (const ws of wb.worksheets) {
      const nama = ws.name.trim();
      const lower = nama.toLowerCase();
      if (lower.includes('future')) {
        const kataHari = lower.replace('future', '').trim();
        const namaHari = HARI_MAP[kataHari] ?? nama;
        hari.push(this.parseHari(ws, namaHari, 'HARIAN'));
      } else if (lower === 'b3') {
        hari.push(this.parseHari(ws, 'B3', 'B3'));
      }
    }

    return { ...anggaran, hari };
  }

  private cellVal(ws: ExcelJS.Worksheet, row: number, col: number): unknown {
    const v = ws.getRow(row).getCell(col).value;
    if (v && typeof v === 'object') {
      if ('result' in v) return (v as { result: unknown }).result;
      if ('richText' in v) {
        return (v as { richText: { text: string }[] }).richText
          .map((t) => t.text)
          .join('');
      }
      if ('text' in v) return (v as { text: string }).text;
      return null;
    }
    return v;
  }

  private num(v: unknown): number {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = parseFloat(v.replace(/[^0-9.-]/g, ''));
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }

  private str(v: unknown): string {
    return v == null ? '' : String(v).trim();
  }

  private parseAnggaran(ws: ExcelJS.Worksheet): {
    totalAnggaran: number;
    penggunaanAnggaran: number;
    sisaAnggaran: number;
  } {
    let total = 0;
    let penggunaan = 0;
    let sisa = 0;
    for (let r = 1; r <= ws.rowCount; r++) {
      const label = this.str(this.cellVal(ws, r, 1)).toLowerCase();
      const nilai = this.num(this.cellVal(ws, r, 2));
      if (label.includes('total anggaran')) total = nilai;
      else if (label.includes('penggunaan')) penggunaan = nilai;
      else if (label.includes('sisa')) sisa = nilai;
    }
    return {
      totalAnggaran: total,
      penggunaanAnggaran: penggunaan,
      sisaAnggaran: sisa,
    };
  }

  private parseHari(
    ws: ExcelJS.Worksheet,
    namaHari: string,
    jenis: 'HARIAN' | 'B3',
  ): ParsedHari {
    let menu: string | null = null;
    let sisaAnggaran = 0;
    let totalBahanBaku = 0;
    let headerRow = -1;
    let penerimaStart = -1;

    for (let r = 1; r <= ws.rowCount; r++) {
      const a = this.str(this.cellVal(ws, r, 1)).toLowerCase();
      if (a === 'menu') menu = this.str(this.cellVal(ws, r, 2)) || null;
      else if (a.startsWith('penerima manfaat')) penerimaStart = r;
      else if (a.startsWith('sisa anggaran'))
        sisaAnggaran = this.num(this.cellVal(ws, r, 2));
      else if (a === 'ctg') headerRow = r;
      else if (a.startsWith('total bahan baku'))
        totalBahanBaku = this.num(this.cellVal(ws, r, 6));
    }

    const penerima: ParsedPenerima[] = [];
    if (penerimaStart > 0) {
      for (let r = penerimaStart; r <= ws.rowCount; r++) {
        const kategori = this.str(this.cellVal(ws, r, 2));
        if (!kategori) break;
        if (kategori.toLowerCase() === 'total') break;
        penerima.push({
          kategori,
          jumlahPorsi: this.num(this.cellVal(ws, r, 3)),
          hargaPerPorsi: this.num(this.cellVal(ws, r, 4)),
          subtotal: this.num(this.cellVal(ws, r, 5)),
        });
      }
    }

    const bahan: ParsedBahan[] = [];
    if (headerRow > 0) {
      for (let r = headerRow + 1; r <= ws.rowCount; r++) {
        const a = this.str(this.cellVal(ws, r, 1)).toLowerCase();
        if (a.startsWith('total bahan baku')) break;
        const item = this.str(this.cellVal(ws, r, 2));
        if (!item) continue;
        bahan.push({
          ctg: this.str(this.cellVal(ws, r, 1)) || null,
          item,
          qty: this.num(this.cellVal(ws, r, 3)),
          satuan: this.str(this.cellVal(ws, r, 4)),
          hargaSatuan: this.num(this.cellVal(ws, r, 5)),
          totalHs: this.num(this.cellVal(ws, r, 6)),
        });
      }
    }

    return { namaHari, jenis, menu, totalBahanBaku, sisaAnggaran, penerima, bahan };
  }
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `cd /home/wanda/mbg-new && npx jest src/modules/rab/rab-parser.service.spec.ts`
Expected: PASS (3 test lulus).

- [ ] **Step 5: Commit**

```bash
cd /home/wanda/mbg-new
git add src/modules/rab/rab-parser.service.ts src/modules/rab/rab-parser.service.spec.ts
git commit -m "feat(rab): parser Excel RAB berbasis label + unit test"
```

---

## Task 4: Service simpan/list/detail/hapus (backend)

**Files:**
- Create: `src/modules/rab/dto/query-rab.dto.ts`
- Create: `src/modules/rab/rab.service.ts`

Mengikuti scoping `sppgId` + `Role.ADMIN_BGN` seperti `keuangan.service.ts`. Penyimpanan satu transaksi (cascade dari `RabMingguan`).

- [ ] **Step 1: Buat `dto/query-rab.dto.ts`**

```typescript
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class QueryRabDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 20;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
```

- [ ] **Step 2: Buat `rab.service.ts`**

```typescript
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabMingguan } from './entities/rab-mingguan.entity';
import { RabHari, JenisRabHari } from './entities/rab-hari.entity';
import { RabParserService } from './rab-parser.service';
import { QueryRabDto } from './dto/query-rab.dto';
import {
  Role,
  UserPayload,
} from '../../common/interfaces/user-payload.interface';

// Ubah nama file jadi label yang manusiawi:
// "P1W1 - RAB minggu 1 periode 1.xlsx" -> "P1W1 - RAB minggu 1 periode 1"
function labelDariFile(namaFile: string): string {
  return namaFile.replace(/\.xlsx$/i, '').trim();
}

@Injectable()
export class RabService {
  constructor(
    @InjectRepository(RabMingguan)
    private readonly rabRepo: Repository<RabMingguan>,
    private readonly parser: RabParserService,
  ) {}

  private sppgIdWajib(user: UserPayload): string {
    if (!user.sppgId) {
      throw new ForbiddenException('Akun ini tidak terkait SPPG manapun');
    }
    return user.sppgId;
  }

  async importDariFile(
    buffer: Buffer,
    namaFile: string,
    user: UserPayload,
  ): Promise<RabMingguan> {
    const parsed = await this.parser.parse(buffer);

    const entity = this.rabRepo.create({
      label: labelDariFile(namaFile),
      totalAnggaran: parsed.totalAnggaran,
      penggunaanAnggaran: parsed.penggunaanAnggaran,
      sisaAnggaran: parsed.sisaAnggaran,
      sumberFile: namaFile,
      sppgId: this.sppgIdWajib(user),
      createdById: user.sub,
      importedAt: new Date(),
      hari: parsed.hari.map((h, i) => ({
        namaHari: h.namaHari,
        jenis: h.jenis as JenisRabHari,
        menu: h.menu,
        totalBahanBaku: h.totalBahanBaku,
        sisaAnggaran: h.sisaAnggaran,
        urutan: i,
        penerima: h.penerima.map((p) => ({ ...p })),
        bahan: h.bahan.map((b, j) => ({ ...b, urutan: j })),
      })) as RabHari[],
    });

    // cascade menyimpan hari + penerima + bahan dalam satu transaksi save
    return this.rabRepo.save(entity);
  }

  async findAll(
    query: QueryRabDto,
    user: UserPayload,
  ): Promise<{ data: RabMingguan[]; total: number }> {
    const qb = this.rabRepo.createQueryBuilder('r');
    if (user.role !== Role.ADMIN_BGN) {
      qb.andWhere('r.sppgId = :sppgId', { sppgId: user.sppgId });
    }
    qb.orderBy('r.importedAt', 'DESC').skip(query.skip).take(query.limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string, user: UserPayload): Promise<RabMingguan> {
    const rab = await this.rabRepo.findOne({
      where: { id },
      relations: ['hari', 'hari.penerima', 'hari.bahan'],
      order: { hari: { urutan: 'ASC', bahan: { urutan: 'ASC' } } },
    });
    if (!rab) throw new NotFoundException('RAB tidak ditemukan');
    if (user.role !== Role.ADMIN_BGN && rab.sppgId !== user.sppgId) {
      throw new ForbiddenException('RAB ini bukan milik SPPG Anda');
    }
    return rab;
  }

  async remove(id: string, user: UserPayload): Promise<void> {
    const rab = await this.findOne(id, user);
    await this.rabRepo.softRemove(rab);
  }
}
```

- [ ] **Step 3: Verifikasi kompilasi**

Run: `cd /home/wanda/mbg-new && npx tsc --noEmit -p tsconfig.json`
Expected: tidak ada error pada `src/modules/rab/rab.service.ts` dan `dto/query-rab.dto.ts`.

- [ ] **Step 4: Commit**

```bash
cd /home/wanda/mbg-new
git add src/modules/rab/rab.service.ts src/modules/rab/dto/query-rab.dto.ts
git commit -m "feat(rab): service import/list/detail/hapus dengan scoping sppg"
```

---

## Task 5: Controller + Module + registrasi (backend)

**Files:**
- Create: `src/modules/rab/rab.controller.ts`
- Create: `src/modules/rab/rab.module.ts`
- Modify: `src/app.module.ts`

Endpoint upload pakai `FileInterceptor` dengan `memoryStorage` (parser butuh Buffer, file tidak perlu disimpan ke disk). Mengikuti guard/role pola `keuangan.controller.ts` + upload pola `upload.controller.ts`.

- [ ] **Step 1: Buat `rab.controller.ts`**

```typescript
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RabService } from './rab.service';
import { QueryRabDto } from './dto/query-rab.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Role } from '../../common/interfaces/user-payload.interface';
import type { UserPayload } from '../../common/interfaces/user-payload.interface';
import type { ApiResponse } from '../../common/interfaces/api-response.interface';
import { buildPaginationMeta } from '../../common/utils/pagination.util';
import type { RabMingguan } from './entities/rab-mingguan.entity';

const XLSX_MIME = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream',
];

@ApiTags('rab')
@ApiBearerAuth()
@Controller('rab')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RabController {
  constructor(private readonly rabService: RabService) {}

  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.KEPALA_SPPG, Role.BENDAHARA)
  @ApiOperation({ summary: 'Import file Excel RAB mingguan' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: UserPayload,
  ): Promise<ApiResponse<RabMingguan>> {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan. Pilih file .xlsx.');
    }
    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException('File harus berformat .xlsx');
    }
    if (file.mimetype && !XLSX_MIME.includes(file.mimetype)) {
      throw new BadRequestException('Tipe file bukan Excel (.xlsx).');
    }
    const data = await this.rabService.importDariFile(
      file.buffer,
      file.originalname,
      user,
    );
    return { success: true, data, message: 'Berhasil import RAB' };
  }

  @Get()
  @Roles(Role.ADMIN_BGN, Role.KEPALA_SPPG, Role.BENDAHARA)
  @ApiOperation({ summary: 'Daftar RAB mingguan' })
  async findAll(
    @Query() query: QueryRabDto,
    @GetUser() user: UserPayload,
  ): Promise<ApiResponse<RabMingguan[]>> {
    const { data, total } = await this.rabService.findAll(query, user);
    return {
      success: true,
      data,
      message: 'Berhasil mengambil daftar RAB',
      meta: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  @Get(':id')
  @Roles(Role.ADMIN_BGN, Role.KEPALA_SPPG, Role.BENDAHARA)
  @ApiOperation({ summary: 'Detail RAB mingguan' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ): Promise<ApiResponse<RabMingguan>> {
    const data = await this.rabService.findOne(id, user);
    return { success: true, data, message: 'Berhasil mengambil detail RAB' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.KEPALA_SPPG, Role.BENDAHARA)
  @ApiOperation({ summary: 'Hapus RAB (soft delete)' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ): Promise<ApiResponse<null>> {
    await this.rabService.remove(id, user);
    return { success: true, data: null, message: 'Berhasil menghapus RAB' };
  }
}
```

- [ ] **Step 2: Buat `rab.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabController } from './rab.controller';
import { RabService } from './rab.service';
import { RabParserService } from './rab-parser.service';
import { RabMingguan } from './entities/rab-mingguan.entity';
import { RabHari } from './entities/rab-hari.entity';
import { RabPenerima } from './entities/rab-penerima.entity';
import { RabBahan } from './entities/rab-bahan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RabMingguan, RabHari, RabPenerima, RabBahan]),
  ],
  controllers: [RabController],
  providers: [RabService, RabParserService],
  exports: [RabService, RabParserService],
})
export class RabModule {}
```

- [ ] **Step 3: Daftarkan `RabModule` di `src/app.module.ts`**

Tambah import di blok import modul (dekat baris `import { SekolahModule }`):

```typescript
import { RabModule } from './modules/rab/rab.module';
```

Tambah `RabModule,` di array `imports` `@Module` (setelah `SekolahModule,`):

```typescript
    SekolahModule,
    RabModule,
```

- [ ] **Step 4: Verifikasi kompilasi + boot**

Run: `cd /home/wanda/mbg-new && npx tsc --noEmit -p tsconfig.json`
Expected: tidak ada error.

- [ ] **Step 5: Commit**

```bash
cd /home/wanda/mbg-new
git add src/modules/rab/rab.controller.ts src/modules/rab/rab.module.ts src/app.module.ts
git commit -m "feat(rab): controller upload/list/detail/hapus + registrasi modul"
```

---

## Task 6: Seed data contoh dari 3 file (backend)

**Files:**
- Modify: `src/database/seed.ts`

Memuat ketiga file `docs/*.xlsx` ke SPPG yang di-seed memakai `RabParserService` langsung (tanpa HTTP). Idempotent: lewati bila `sumber_file` sudah ada.

- [ ] **Step 1: Tambah import di atas `src/database/seed.ts`**

Setelah baris `import { Role } from '../common/interfaces/user-payload.interface';` tambah:

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';
import { RabParserService } from '../modules/rab/rab-parser.service';
import { RabMingguan } from '../modules/rab/entities/rab-mingguan.entity';
import { RabHari } from '../modules/rab/entities/rab-hari.entity';
```

- [ ] **Step 2: Tambah konstanta daftar file (dekat `USERS_SEED`)**

```typescript
const RAB_FILES_SEED = [
  'P1W1 - RAB minggu 1 periode 1.xlsx',
  'minggu 1 periode 2.xlsx',
  'minggu 2 periode 1.xlsx',
];
```

- [ ] **Step 3: Tambah blok seed RAB sebelum `console.log('Selesai.')`**

```typescript
    // Seed RAB contoh dari file Excel asli
    const rabRepo = AppDataSource.getRepository(RabMingguan);
    const parser = new RabParserService();
    for (const namaFile of RAB_FILES_SEED) {
      const sudahAda = await rabRepo.findOne({
        where: { sumberFile: namaFile },
      });
      if (sudahAda) {
        console.log(`RAB "${namaFile}" sudah ada, dilewati.`);
        continue;
      }
      const buf = readFileSync(join(process.cwd(), 'docs', namaFile));
      const parsed = await parser.parse(buf);
      const entity = rabRepo.create({
        label: namaFile.replace(/\.xlsx$/i, '').trim(),
        totalAnggaran: parsed.totalAnggaran,
        penggunaanAnggaran: parsed.penggunaanAnggaran,
        sisaAnggaran: parsed.sisaAnggaran,
        sumberFile: namaFile,
        sppgId: sppg.id,
        createdById: null,
        importedAt: new Date(),
        hari: parsed.hari.map((h, i) => ({
          namaHari: h.namaHari,
          jenis: h.jenis,
          menu: h.menu,
          totalBahanBaku: h.totalBahanBaku,
          sisaAnggaran: h.sisaAnggaran,
          urutan: i,
          penerima: h.penerima.map((p) => ({ ...p })),
          bahan: h.bahan.map((b, j) => ({ ...b, urutan: j })),
        })) as RabHari[],
      });
      await rabRepo.save(entity);
      console.log(`RAB "${namaFile}" dibuat (${parsed.hari.length} hari).`);
    }
```

- [ ] **Step 4: Jalankan seed**

Run: `cd /home/wanda/mbg-new && npm run seed`
Expected: tiga baris `RAB "..." dibuat (N hari).` lalu `Selesai.`

- [ ] **Step 5: Verifikasi data masuk**

Run: `docker exec mbg-postgres psql -U postgres -d mbg_db -c "SELECT label, total_anggaran, sisa_anggaran FROM rab_mingguan ORDER BY label;"`
Expected: 3 baris, file 1 `total_anggaran = 17346000.00`, `sisa_anggaran = 27250.00`.

- [ ] **Step 6: Commit**

```bash
cd /home/wanda/mbg-new
git add src/database/seed.ts
git commit -m "feat(rab): seed 3 file RAB asli sebagai data contoh"
```

---

## Task 7: Verifikasi endpoint backend (smoke test)

**Files:** tidak ada perubahan kode — verifikasi end-to-end backend.

- [ ] **Step 1: Pastikan Postgres & backend jalan**

Run: `docker start mbg-postgres; cd /home/wanda/mbg-new && (npm run start:dev > /tmp/rab-be.log 2>&1 &) ; sleep 12; grep -c "successfully started" /tmp/rab-be.log`
Expected: `1` (aplikasi berhasil start). Jika `0`, baca `/tmp/rab-be.log`.

- [ ] **Step 2: Login ambil token**

Run:
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"kepala@sppg.id","password":"Password123!"}' | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).data.accessToken))")
echo "$TOKEN" | head -c 20
```
Expected: tercetak awalan token (mis. `eyJ...`).

- [ ] **Step 3: GET daftar RAB**

Run: `curl -s http://localhost:3000/api/v1/rab -H "Authorization: Bearer $TOKEN" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log('jumlah:',j.data.length,'| label[0]:',j.data[0]?.label)})"`
Expected: `jumlah: 3 | label[0]: ...`

- [ ] **Step 4: GET detail RAB + cek isi hari**

Run:
```bash
ID=$(curl -s http://localhost:3000/api/v1/rab -H "Authorization: Bearer $TOKEN" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).data[0].id))")
curl -s http://localhost:3000/api/v1/rab/$ID -H "Authorization: Bearer $TOKEN" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const r=JSON.parse(s).data;console.log('hari:',r.hari.length,'| hari[0]:',r.hari[0].namaHari,'| bahan[0]:',r.hari[0].bahan[0]?.item)})"
```
Expected: `hari: N | hari[0]: Senin | bahan[0]: Beras` (atau item pertama yang sesuai file pertama).

- [ ] **Step 5: Uji import via HTTP (file asli)**

Run: `curl -s -X POST http://localhost:3000/api/v1/rab/import -H "Authorization: Bearer $TOKEN" -F "file=@/home/wanda/mbg-new/docs/minggu 2 periode 1.xlsx" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log(j.success, j.message, j.data?.label)})"`
Expected: `true Berhasil import RAB minggu 2 periode 1`

- [ ] **Step 6: Uji tolak file salah format**

Run: `echo "bukan excel" > /tmp/bad.xlsx; curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/v1/rab/import -H "Authorization: Bearer $TOKEN" -F "file=@/tmp/bad.xlsx"`
Expected: `400` (bukan 500).

- [ ] **Step 7: Hentikan backend dev**

Run: `pkill -f "nest start" || true`
Catatan: tidak ada commit (langkah verifikasi saja).

---

## Task 8: Tipe frontend (frontend)

**Files:**
- Modify: `src/types/index.ts`

Tambah tipe `Rab*` mengikuti gaya tipe lain di file (lihat `interface Keuangan` & `ApiResponse`).

- [ ] **Step 1: Tambah tipe di akhir `src/types/index.ts`**

```typescript
export type JenisRabHari = 'HARIAN' | 'B3'

export interface RabPenerima {
  id: string
  kategori: string
  jumlahPorsi: number
  hargaPerPorsi: number
  subtotal: number
}

export interface RabBahan {
  id: string
  ctg: string | null
  item: string
  qty: number
  satuan: string
  hargaSatuan: number
  totalHs: number
  urutan: number
}

export interface RabHari {
  id: string
  namaHari: string
  jenis: JenisRabHari
  menu: string | null
  totalBahanBaku: number
  sisaAnggaran: number
  urutan: number
  penerima: RabPenerima[]
  bahan: RabBahan[]
}

export interface RabMingguan {
  id: string
  label: string
  totalAnggaran: number
  penggunaanAnggaran: number
  sisaAnggaran: number
  sumberFile: string
  importedAt: string
  hari?: RabHari[]
}
```

- [ ] **Step 2: Verifikasi kompilasi**

Run: `cd /home/wanda/mbg-web && npx tsc --noEmit`
Expected: tidak ada error baru.

- [ ] **Step 3: Commit**

```bash
cd /home/wanda/mbg-web
git add src/types/index.ts
git commit -m "feat(rab): tipe RabMingguan/Hari/Penerima/Bahan"
```

---

## Task 9: Endpoint API frontend (frontend)

**Files:**
- Create: `src/api/endpoints/rab.ts`

Mengikuti pola `src/api/endpoints/keuangan.ts`. Import pakai `FormData` + override `Content-Type` ke `multipart/form-data`.

- [ ] **Step 1: Buat `src/api/endpoints/rab.ts`**

```typescript
import { api } from '@/api/axios'
import type { ApiResponse, RabMingguan } from '@/types'

export const rabApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<RabMingguan[]>>('/rab', { params }),
  detail: (id: string) => api.get<ApiResponse<RabMingguan>>(`/rab/${id}`),
  import: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<RabMingguan>>('/rab/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete: (id: string) => api.delete(`/rab/${id}`),
}
```

- [ ] **Step 2: Verifikasi kompilasi**

Run: `cd /home/wanda/mbg-web && npx tsc --noEmit`
Expected: tidak ada error baru.

- [ ] **Step 3: Commit**

```bash
cd /home/wanda/mbg-web
git add src/api/endpoints/rab.ts
git commit -m "feat(rab): endpoint API frontend list/detail/import/hapus"
```

---

## Task 10: Halaman daftar + Import (frontend)

**Files:**
- Create: `src/pages/rab/RabListPage.tsx`

Mengikuti pola `src/pages/keuangan/KeuanganListPage.tsx` (TanStack Query, kelas Tailwind `bgn-*`, `Pagination`). Tombol Import membuka file picker tersembunyi, kirim via mutation, tampilkan pesan sukses/gagal.

- [ ] **Step 1: Buat `src/pages/rab/RabListPage.tsx`**

```tsx
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { rabApi } from '@/api/endpoints/rab'
import { Pagination } from '@/components/Pagination'

const fRp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID')

export function RabListPage() {
  const [page, setPage] = useState(1)
  const [pesan, setPesan] = useState<{ tipe: 'ok' | 'err'; teks: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['rab', page],
    queryFn: () => rabApi.list({ page, limit: 20 }),
  })

  const importMutation = useMutation({
    mutationFn: (file: File) => rabApi.import(file),
    onSuccess: (res) => {
      setPesan({ tipe: 'ok', teks: `Berhasil import "${res.data.data.label}".` })
      qc.invalidateQueries({ queryKey: ['rab'] })
    },
    onError: (err) => {
      const teks = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Gagal import file.')
        : 'Gagal import file.'
      setPesan({ tipe: 'err', teks: Array.isArray(teks) ? teks.join(', ') : teks })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: rabApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rab'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">RAB Mingguan</h1>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importMutation.mutate(f)
              e.target.value = ''
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importMutation.isPending}
            className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-60"
          >
            {importMutation.isPending ? 'Mengimpor...' : '+ Import Excel'}
          </button>
        </div>
      </div>

      {pesan && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            pesan.tipe === 'ok'
              ? 'bg-bgn-50 border border-bgn-200 text-bgn-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {pesan.teks}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Label</th>
                <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Total anggaran</th>
                <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Penggunaan</th>
                <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Sisa</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Diimpor</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((r) => (
                <tr key={r.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    <Link to={`/rab/${r.id}`} className="text-bgn-700 hover:underline">
                      {r.label}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{fRp(r.totalAnggaran)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fRp(r.penggunaanAnggaran)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${r.sisaAnggaran < 0 ? 'text-red-600' : 'text-bgn-800'}`}>
                    {fRp(r.sisaAnggaran)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.importedAt?.slice(0, 10)}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <Link to={`/rab/${r.id}`} className="text-bgn-600 hover:underline text-sm">Lihat</Link>
                    <button
                      onClick={() => { if (confirm('Hapus RAB ini?')) deleteMutation.mutate(r.id) }}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada RAB. Klik "Import Excel" untuk menambah.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi kompilasi**

Run: `cd /home/wanda/mbg-web && npx tsc --noEmit`
Expected: tidak ada error (route belum terpasang, tapi file mandiri harus kompilasi).

- [ ] **Step 3: Commit**

```bash
cd /home/wanda/mbg-web
git add src/pages/rab/RabListPage.tsx
git commit -m "feat(rab): halaman daftar RAB + import Excel"
```

---

## Task 11: Halaman detail read-only (frontend)

**Files:**
- Create: `src/pages/rab/RabDetailPage.tsx`

Tampilkan ringkasan anggaran + pemilih hari + tabel penerima & bahan. Pakai `useParams`, `rabApi.detail`.

- [ ] **Step 1: Buat `src/pages/rab/RabDetailPage.tsx`**

```tsx
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { rabApi } from '@/api/endpoints/rab'

const fRp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID')
const fQty = (n: number) => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 3 })

export function RabDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [hariAktif, setHariAktif] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['rab', id],
    queryFn: () => rabApi.detail(id!),
    enabled: !!id,
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const rab = data?.data.data
  if (!rab) return <p className="text-gray-500">RAB tidak ditemukan.</p>

  const hariList = rab.hari ?? []
  const hari = hariList[hariAktif]

  return (
    <div>
      <div className="mb-4">
        <Link to="/rab" className="text-bgn-600 hover:underline text-sm">&larr; Kembali ke daftar</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{rab.label}</h1>

      {/* Ringkasan anggaran */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-bgn-50 border border-bgn-200 rounded-xl p-4">
          <p className="text-sm text-bgn-800">Total anggaran</p>
          <p className="text-lg font-bold text-bgn-900">{fRp(rab.totalAnggaran)}</p>
        </div>
        <div className="bg-bgn-50 border border-bgn-200 rounded-xl p-4">
          <p className="text-sm text-bgn-800">Penggunaan</p>
          <p className="text-lg font-bold text-bgn-900">{fRp(rab.penggunaanAnggaran)}</p>
        </div>
        <div className={`rounded-xl p-4 border ${rab.sisaAnggaran < 0 ? 'bg-red-50 border-red-200' : 'bg-bgn-50 border-bgn-200'}`}>
          <p className={`text-sm ${rab.sisaAnggaran < 0 ? 'text-red-600' : 'text-bgn-800'}`}>Sisa</p>
          <p className={`text-lg font-bold ${rab.sisaAnggaran < 0 ? 'text-red-700' : 'text-bgn-900'}`}>{fRp(rab.sisaAnggaran)}</p>
        </div>
      </div>

      {/* Pemilih hari */}
      <div className="mb-4 flex flex-wrap gap-2">
        {hariList.map((h, i) => (
          <button
            key={h.id}
            onClick={() => setHariAktif(i)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              i === hariAktif ? 'bg-bgn-green-400 text-white border-bgn-800' : 'border-gray-300 text-gray-600 hover:border-bgn-600'
            }`}
          >
            {h.namaHari}
          </button>
        ))}
      </div>

      {hari && (
        <div className="space-y-6">
          {hari.menu && (
            <div className="bg-white rounded-xl border border-bgn-100 p-4">
              <p className="text-sm text-gray-500 mb-1">Menu</p>
              <p className="text-gray-800">{hari.menu}</p>
            </div>
          )}

          {/* Penerima manfaat */}
          <div className="bg-white rounded-xl shadow-sm border border-bgn-100 overflow-hidden">
            <div className="px-4 py-2 bg-bgn-50 text-bgn-900 font-semibold text-sm">Penerima manfaat</div>
            <table className="w-full text-sm">
              <thead className="bg-bgn-100">
                <tr>
                  <th className="text-left px-4 py-2 text-bgn-900">Kategori</th>
                  <th className="text-right px-4 py-2 text-bgn-900">Porsi</th>
                  <th className="text-right px-4 py-2 text-bgn-900">Harga/porsi</th>
                  <th className="text-right px-4 py-2 text-bgn-900">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bgn-100">
                {hari.penerima.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-gray-700">{p.kategori}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{p.jumlahPorsi.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{fRp(p.hargaPerPorsi)}</td>
                    <td className="px-4 py-2 text-right text-gray-700 font-medium">{fRp(p.subtotal)}</td>
                  </tr>
                ))}
                {hari.penerima.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-400">Tidak ada data penerima</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bahan baku */}
          <div className="bg-white rounded-xl shadow-sm border border-bgn-100 overflow-hidden">
            <div className="px-4 py-2 bg-bgn-50 text-bgn-900 font-semibold text-sm">Bahan baku</div>
            <table className="w-full text-sm">
              <thead className="bg-bgn-100">
                <tr>
                  <th className="text-left px-4 py-2 text-bgn-900">Item</th>
                  <th className="text-right px-4 py-2 text-bgn-900">Qty</th>
                  <th className="text-left px-4 py-2 text-bgn-900">Satuan</th>
                  <th className="text-right px-4 py-2 text-bgn-900">Harga satuan</th>
                  <th className="text-right px-4 py-2 text-bgn-900">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bgn-100">
                {hari.bahan.map((b) => (
                  <tr key={b.id} className="odd:bg-white even:bg-bgn-50">
                    <td className="px-4 py-2 text-gray-700">{b.item}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{fQty(b.qty)}</td>
                    <td className="px-4 py-2 text-gray-600">{b.satuan}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{fRp(b.hargaSatuan)}</td>
                    <td className="px-4 py-2 text-right text-gray-700 font-medium">{fRp(b.totalHs)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-bgn-100 font-semibold">
                  <td className="px-4 py-2 text-bgn-900" colSpan={4}>Total bahan baku</td>
                  <td className="px-4 py-2 text-right text-bgn-900">{fRp(hari.totalBahanBaku)}</td>
                </tr>
                <tr className={hari.sisaAnggaran < 0 ? 'bg-red-50' : ''}>
                  <td className="px-4 py-2 text-gray-700" colSpan={4}>Sisa anggaran hari ini</td>
                  <td className={`px-4 py-2 text-right font-medium ${hari.sisaAnggaran < 0 ? 'text-red-600' : 'text-bgn-800'}`}>{fRp(hari.sisaAnggaran)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi kompilasi**

Run: `cd /home/wanda/mbg-web && npx tsc --noEmit`
Expected: tidak ada error.

- [ ] **Step 3: Commit**

```bash
cd /home/wanda/mbg-web
git add src/pages/rab/RabDetailPage.tsx
git commit -m "feat(rab): halaman detail RAB read-only"
```

---

## Task 12: Routing + menu sidebar (frontend)

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Tambah import halaman di `src/App.tsx`**

Setelah baris `import { LaporanFormPage } from '@/pages/laporan/LaporanFormPage'` tambah:

```typescript
import { RabListPage } from '@/pages/rab/RabListPage'
import { RabDetailPage } from '@/pages/rab/RabDetailPage'
```

- [ ] **Step 2: Tambah route di `src/App.tsx`**

Setelah route `<Route path="keuangan/baru" .../>` (atau dekat grup keuangan), tambah:

```tsx
          <Route path="rab" element={<RabListPage />} />
          <Route path="rab/:id" element={<RabDetailPage />} />
```

- [ ] **Step 3: Tambah menu di `src/components/Layout.tsx`**

Di array operasional, setelah baris item Keuangan (`{ num: 6, to: '/keuangan', ... }`), tambah item baru (tanpa nomor, sebagai sub dari Keuangan):

```typescript
  { to: '/rab', label: 'RAB mingguan', roles: [...INTI, 'BENDAHARA'] },
```

(`INTI` sudah mencakup `KEPALA_SPPG`. Pastikan tipe `NavItem.num` opsional — sudah `num?: number`.)

- [ ] **Step 4: Verifikasi kompilasi**

Run: `cd /home/wanda/mbg-web && npx tsc --noEmit`
Expected: tidak ada error.

- [ ] **Step 5: Commit**

```bash
cd /home/wanda/mbg-web
git add src/App.tsx src/components/Layout.tsx
git commit -m "feat(rab): route /rab dan menu sidebar RAB mingguan"
```

---

## Task 13: Verifikasi end-to-end di browser (frontend)

**Files:** tidak ada perubahan kode — verifikasi manual.

- [ ] **Step 1: Nyalakan backend + frontend**

Run:
```bash
docker start mbg-postgres
cd /home/wanda/mbg-new && (npm run start:dev > /tmp/rab-be.log 2>&1 &)
cd /home/wanda/mbg-web && (npm run dev > /tmp/rab-fe.log 2>&1 &)
sleep 12; grep -c "successfully started" /tmp/rab-be.log; grep -c "ready in" /tmp/rab-fe.log
```
Expected: kedua angka `1`.

- [ ] **Step 2: Login & buka halaman RAB (Playwright MCP)**

Pakai Playwright MCP: `browser_navigate` ke `http://localhost:5173/login`, login `kepala@sppg.id` / `Password123!`, lalu `browser_navigate` ke `http://localhost:5173/rab`. `browser_snapshot`.
Expected: tabel berisi 3 RAB (label dari 3 file), menu sidebar "RAB mingguan" terlihat.

- [ ] **Step 3: Buka detail & cek tampilan**

Klik label RAB pertama (atau `browser_navigate` ke `/rab/<id>`). `browser_take_screenshot`.
Expected: kartu ringkasan anggaran (total/penggunaan/sisa), tab hari (Senin, Selasa, …), tabel penerima manfaat & tabel bahan baku dengan "Total bahan baku" di footer. Cocokkan angka file 1: total anggaran Rp 17.346.000, Senin total bahan baku Rp 6.215.750.

- [ ] **Step 4: Uji import dari UI**

Di `/rab`, gunakan tombol "+ Import Excel" untuk meng-upload `/home/wanda/mbg-new/docs/minggu 2 periode 1.xlsx` (lewat `browser_file_upload` jika tersedia, atau verifikasi jalur backend sudah dibuktikan di Task 7). Pastikan muncul pesan hijau "Berhasil import ...".
Expected: notifikasi sukses, daftar bertambah (atau tetap jika idempotensi label sama — duplikat diperbolehkan karena `sumber_file` tidak unik; cukup pastikan tidak error).

- [ ] **Step 5: Hentikan server**

Run: `pkill -f "nest start" || true; pkill -f "vite" || true; docker stop mbg-postgres`
Catatan: langkah verifikasi, tanpa commit.

---

## Catatan implementasi

- **Lintas-repo:** backend `mbg-new` & frontend `mbg-web` adalah repo git terpisah; commit di masing-masing repo sesuai path tugas.
- **Idempotensi seed:** seed melewati file yang `sumber_file`-nya sudah ada — aman dijalankan berulang.
- **Duplikat import:** `sumber_file` sengaja TIDAK unik agar staf bisa mengganti/upload ulang; penanganan versi/duplikat adalah increment berikutnya (di luar lingkup).
- **Read-only:** tidak ada layar buat/edit RAB di increment ini — sesuai spec.
