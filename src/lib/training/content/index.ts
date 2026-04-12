import { ModuleContent } from '@/types/training';
import { M01Content } from './M01';
import { M02Content } from './M02';
import { M03Content } from './M03';
import { M04Content } from './M04';
import { M05Content } from './M05';
import { M06Content } from './M06';
import { M07Content } from './M07';
import { M08Content } from './M08';
import { M09Content } from './M09';
import { M10Content } from './M10';
import { M11Content } from './M11';
import { M12Content } from './M12';
import { M13Content } from './M13';
import { M14Content } from './M14';
import { M15Content } from './M15';
import { M16Content } from './M16';
import { M17Content } from './M17';
import { M18Content } from './M18';
import { M19Content } from './M19';
import { M20Content } from './M20';
import { M21Content } from './M21';
import { M22Content } from './M22';
import { M23Content } from './M23';
import { M24Content } from './M24';
import { M25Content } from './M25';
import { M26Content } from './M26';
import { M27Content } from './M27';
import { M28Content } from './M28';
import { M29Content } from './M29';
import { M30Content } from './M30';

export const moduleContents: Record<string, ModuleContent> = {
  M01: M01Content,
  M02: M02Content,
  M03: M03Content,
  M04: M04Content,
  M05: M05Content,
  M06: M06Content,
  M07: M07Content,
  M08: M08Content,
  M09: M09Content,
  M10: M10Content,
  M11: M11Content,
  M12: M12Content,
  M13: M13Content,
  M14: M14Content,
  M15: M15Content,
  M16: M16Content,
  M17: M17Content,
  M18: M18Content,
  M19: M19Content,
  M20: M20Content,
  M21: M21Content,
  M22: M22Content,
  M23: M23Content,
  M24: M24Content,
  M25: M25Content,
  M26: M26Content,
  M27: M27Content,
  M28: M28Content,
  M29: M29Content,
  M30: M30Content,
};

export function getModuleContent(moduleId: string): ModuleContent | undefined {
  return moduleContents[moduleId];
}
