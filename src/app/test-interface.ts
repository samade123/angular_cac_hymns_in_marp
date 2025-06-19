export interface NotionDBQuery {
  object: string;
  results: Result[];
  next_cursor: null;
  has_more: boolean;
  type: string;
  page_or_database: PageOrDatabase;
  request_id: string;
}

export interface PageOrDatabase {}

export interface Result {
  object: string;
  id: string;
  created_time: Date;
  last_edited_time: Date;
  created_by: TedBy;
  last_edited_by: TedBy;
  cover: null;
  icon: null;
  parent: Parent;
  archived: boolean;
  properties: Properties;
  url: string;
  public_url: null;
}

export interface TedBy {
  object: string;
  id: string;
}

export interface Parent {
  type: string;
  database_id: string;
}

export interface Properties {
  'Files & media': FilesMedia;
  Name: Name;
  Number: Number;
}

export interface FilesMedia {
  id: string;
  type: string;
  files: FileElement[];
}

export interface FileElement {
  name: string;
  type: string;
  file: FileFile;
}

export interface FileFile {
  url: string;
  expiry_time: Date;
}

export interface Name {
  id: string;
  type: string;
  rich_text: RichText[];
}

export interface RichText {
  type: string;
  text: Text;
  annotations: Annotations;
  plain_text: string;
  href: null;
}

export interface Annotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

export interface Text {
  content: string;
  link: null;
}

export interface Number {
  id: string;
  type: string;
  title: RichText[];
}

export interface RequestOptions {
  method: string;
  redirect: RequestRedirect;
}

export interface BaseHymn {
  id: string;
  name: string;
  hymnNumber: string;
}

export interface SimpleHymn extends BaseHymn {
  last_edited_time: Date;
  url: string;
}

export interface SimpleHymnItem extends BaseHymn {
  last_used_time: Date;
  marp: string;
}

export interface hymnUiObj extends BaseHymn {
  last_used_time?: Date;
  last_edited_time?: Date;
}
