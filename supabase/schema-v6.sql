-- Schema v6: volleyball set scores
alter table matches add column if not exists set_scores jsonb;
-- set_scores format: [[t1_pts, t2_pts], ...] per set
-- e.g. [[25,20],[23,25],[15,12]] → ratio 2:1
