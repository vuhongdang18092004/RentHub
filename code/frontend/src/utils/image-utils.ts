export function getPrimaryImage(product: any): string {
  if (!product) return "";
  if (typeof product.primaryImageUrl === "string" && product.primaryImageUrl) return product.primaryImageUrl;
  if (typeof product.primaryImage === "string" && product.primaryImage) {
    if (product.primaryImage.startsWith("[")) {
      try {
        const parsed = JSON.parse(product.primaryImage);
        return parsed[0] || "";
      } catch (e) {
        return "";
      }
    }
    return product.primaryImage;
  }
  if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
  if (typeof product.images === "string" && product.images.startsWith("[")) {
    try {
      const parsed = JSON.parse(product.images);
      return parsed[0] || "";
    } catch (e) {
      return "";
    }
  }
  return "";
}
