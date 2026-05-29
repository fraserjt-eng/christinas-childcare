// Media is namespaced under the ticket id so one ticket's files group together
// and are easy to purge as a unit.
export function audioObjectPath(ticketId: string, ext = 'webm') {
  return `${ticketId}/audio.${ext}`;
}

export function imageObjectPath(ticketId: string, ext = 'jpg') {
  return `${ticketId}/photo.${ext}`;
}
