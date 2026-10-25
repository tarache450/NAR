export type ProductEvent =
  | 'search_started' | 'search_completed' | 'publish_started'
  | 'trip_published' | 'seat_requested' | 'request_accepted';

// Local extension point. No third-party SDK, network request, identifiers or route text.
export function trackProductEvent(name: ProductEvent, count?: number) {
  window.dispatchEvent(new CustomEvent('nar:product-event', { detail: { name, ...(count === undefined ? {} : { count }) } }));
}
