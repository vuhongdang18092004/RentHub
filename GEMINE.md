# API Contract & Backend Sync Documentation (GEMINE.md)

This document maps the API contracts of the base UI components and the synchronization details between the Spring Boot backend DTOs/Entities and the Next.js React frontend.

---

## 1. Base Component Contracts

Below is the summary of types, props, and sizes for all base components located in `src/components/base`.

### 1.1 Buttons (`buttons/`)
* **Button** (`button.tsx`)
  - **Props**: `ButtonProps` (Omit standard HTML color overrides)
  - **Sizes**: `ButtonSize` (`"xs" | "sm" | "md" | "lg" | "xl"`)
  - **Colors**: `ButtonColor` (`"primary" | "secondary" | "tertiary" | "link-color" | "link-gray" | "primary-destructive" | "secondary-destructive" | "tertiary-destructive" | "link-destructive"`)
* **ButtonUtility** (`button-utility.tsx`)
  - **Props**: `ButtonUtilityProps`
  - **Sizes**: `ButtonUtilitySize` (`"xs" | "sm"`)
  - **Colors**: `ButtonUtilityColor` (`"secondary" | "tertiary"`)
* **CloseButton** (`close-button.tsx`)
  - **Props**: `CloseButtonProps`
  - **Sizes**: `CloseButtonSize` (`"xs" | "sm" | "md" | "lg"`)
* **SocialButton** (`social-button.tsx`)
  - **Props**: `SocialButtonProps`
  - **Brands**: `SocialBrand` (`"google" | "apple" | "facebook" | "twitter" | "github"`)
  - **Sizes**: `SocialButtonSize` (`"sm" | "md" | "lg"`)
  - **Variants**: `SocialButtonVariant` (`"filled" | "outline" | "transparent"`)
* **AppStoreButtons** (`app-store-buttons.tsx` / `app-store-buttons-outline.tsx`)
  - **Props**: `AppStoreButtonsProps` / `AppStoreButtonsOutlineProps`
  - **Platforms**: `AppStorePlatform` (`"ios" | "android"`)

### 1.2 Avatar (`avatar/`)
* **Avatar** (`avatar.tsx`)
  - **Props**: `AvatarProps`
  - **Sizes**: `AvatarSize` (`"xs" | "sm" | "md" | "lg" | "xl" | "2xl"`)
  - **Statuses**: `AvatarStatus` (`"online" | "offline"`)
* **AvatarLabelGroup** (`avatar-label-group.tsx`)
  - **Props**: `AvatarLabelGroupProps`
* **AvatarProfilePhoto** (`avatar-profile-photo.tsx`)
  - **Props**: `AvatarProfilePhotoProps`

### 1.3 Badges (`badges/`)
* **Badges** (`badges.tsx`)
  - **Props**: `BadgeProps`, `BadgeWithDotProps`, `BadgeWithIconProps`, `BadgeWithButtonProps`, `BadgeIconProps`
  - **Sizes**: `BadgeSize` (`"sm" | "md" | "lg"`)
  - **Types**: `BadgeType` (`"pill-color" | "color" | "modern"`)
  - **Colors**: `BadgeColor` (`"gray" | "brand" | "error" | "warning" | "success" | "slate" | "sky" | "blue" | "indigo" | "purple" | "pink" | "orange"`)

### 1.4 Inputs (`input/`)
* **Input** (`input.tsx`)
  - **Props**: `InputProps`
  - **Sizes**: `InputSize` (`"sm" | "md" | "lg"`)
  - **Types**: `InputType` (`"text" | "email" | "password" | "search" | "tel" | "url"`)
* **PinInput** (`pin-input.tsx`)
  - **Props**: `PinInputProps`
  - **Lengths**: `PinLength` (`4 | 6`)
* **Textarea** (`textarea.tsx`)
  - **Props**: `TextareaProps`
  - **Sizes**: `TextareaSize` (`"sm" | "md" | "lg"`)

---

## 2. Backend DTO Synchronization Mappings

The frontend files mapping user auth, product details, and categories are defined under `src/types/backend.ts` and sync directly with Gradle backend entities.

| Backend Java Class (DTO / Entity) | Frontend TypeScript Interface | File Path |
| --- | --- | --- |
| `com.ioc.internship.entity.ProductStatus` | `ProductStatus` (`'AVAILABLE' \| 'RENTED' \| 'UNAVAILABLE'`) | `src/types/backend.ts` |
| `com.ioc.internship.dto.request.LoginRequest` | `LoginRequest` | `src/types/backend.ts` |
| `com.ioc.internship.dto.request.RegisterRequest` | `RegisterRequest` | `src/types/backend.ts` |
| `com.ioc.internship.dto.response.AuthResponse` | `AuthResponse` | `src/types/backend.ts` |
| `com.ioc.internship.dto.response.UserSummaryResponse` | `UserSummaryResponse` | `src/types/backend.ts` |
| `com.ioc.internship.dto.response.CategoryResponse` | `CategoryResponse` | `src/types/backend.ts` |
| `com.ioc.internship.dto.request.CategoryRequest` | `CategoryRequest` | `src/types/backend.ts` |
| `com.ioc.internship.dto.request.ProductImageRequest` | `ProductImageRequest` | `src/types/backend.ts` |
| `com.ioc.internship.dto.response.ProductImageResponse` | `ProductImageResponse` | `src/types/backend.ts` |
| `com.ioc.internship.dto.request.CreateProductRequest` | `CreateProductRequest` | `src/types/backend.ts` |
| `com.ioc.internship.dto.request.UpdateProductRequest` | `UpdateProductRequest` | `src/types/backend.ts` |
| `com.ioc.internship.dto.response.ProductSummaryResponse` | `ProductSummaryResponse` | `src/types/backend.ts` |
| `com.ioc.internship.dto.response.ProductDetailResponse` | `ProductDetailResponse` | `src/types/backend.ts` |

---

## 3. Benefits of this Architecture

1. **Decoupled API Contracts**: Frontend developers can build pages and mocks independently of backend deployment since components adhere to strict contracts.
2. **Type Safety**: Mapped properties prevent runtime errors when consuming REST APIs from the backend.
3. **Accessibility Out-of-the-box**: Every primitive references properties designed around React Aria accessibility conventions (e.g., `isDisabled` instead of `disabled`, proper `isSelected` overrides).
