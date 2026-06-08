-- Schema v4: court + schedule_order for unified match schedule view
alter table matches add column if not exists court int not null default 1;
alter table matches add column if not exists schedule_order int;
