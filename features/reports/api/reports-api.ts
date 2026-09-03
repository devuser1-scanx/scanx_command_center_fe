// features/reports/api/reports-api.ts

import { apiClient, apiRequestBlob } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export type ReportSource = "tricefy" | "fibroscan";

export type ReportGroup = {
  id: string;
  source: ReportSource;
  name: string;
  fileCount: number;
  updatedAt: string | null;
};

export type ReportGroupList = {
  items: ReportGroup[];
  total: number;
  page: number;
  pageSize: number;
};

export type ReportFile = {
  id: string;
  fileName: string;
  sizeBytes: number;
  updatedAt: string | null;
};

export type ReportGroupFiles = {
  groupId: string;
  groupName: string;
  source: ReportSource;
  files: ReportFile[];
};

type ApiReportGroup = {
  id: string;
  source: ReportSource;
  name: string;
  file_count: number;
  updated_at: string | null;
};

type ApiReportGroupList = {
  items: ApiReportGroup[];
  total: number;
  page: number;
  page_size: number;
};

type ApiReportFile = {
  id: string;
  file_name: string;
  size_bytes: number;
  updated_at: string | null;
};

type ApiReportGroupFiles = {
  group_id: string;
  group_name: string;
  source: ReportSource;
  files: ApiReportFile[];
};

function mapReportGroup(item: ApiReportGroup): ReportGroup {
  return {
    id: item.id,
    source: item.source,
    name: item.name,
    fileCount: item.file_count,
    updatedAt: item.updated_at,
  };
}

function mapReportFile(item: ApiReportFile): ReportFile {
  return {
    id: item.id,
    fileName: item.file_name,
    sizeBytes: item.size_bytes,
    updatedAt: item.updated_at,
  };
}

export async function listReportGroups(params: {
  search?: string;
  page: number;
  pageSize: number;
}): Promise<ReportGroupList> {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));

  const response = await apiClient.get<ApiReportGroupList>(
    `${API_ENDPOINTS.reports.groups}?${query.toString()}`,
  );

  return {
    items: response.items.map(mapReportGroup),
    total: response.total,
    page: response.page,
    pageSize: response.page_size,
  };
}

export async function getReportGroupFiles(
  groupId: string,
): Promise<ReportGroupFiles> {
  const response = await apiClient.get<ApiReportGroupFiles>(
    API_ENDPOINTS.reports.groupFiles(groupId),
  );

  return {
    groupId: response.group_id,
    groupName: response.group_name,
    source: response.source,
    files: response.files.map(mapReportFile),
  };
}

export async function fetchReportFileBlob(
  groupId: string,
  fileId: string,
  mode: "inline" | "attachment",
): Promise<Blob> {
  return apiRequestBlob(
    API_ENDPOINTS.reports.fileContent(groupId, fileId, mode),
  );
}
