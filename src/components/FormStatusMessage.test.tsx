import { render } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import FormStatusMessage, { formatDate } from "./FormStatusMessage";
import type { FormType } from "../constants/formTypes";
import type { FormStatus } from "../types/formStatusTypes";

describe("FormStatusMessage", () => {
  const formType: FormType = "YSQ";
  const formActionLoading: Record<FormType, boolean> = {
    SMI: false,
    YSQ: false,
    BECKS: false,
    BURNS: false,
  };

  test("shows loading state when formActionLoading is true", () => {
    const { getByText } = render(
      <FormStatusMessage
        status={undefined}
        formType={formType}
        formActionLoading={{ ...formActionLoading, YSQ: true }}
        clientInactive={false}
      />
    );

    expect(getByText(/loading/i)).toBeInTheDocument();
  });

  test("shows 'No data found' when status is null", () => {
    const { getByText } = render(
      <FormStatusMessage
        status={undefined}
        formType={formType}
        formActionLoading={formActionLoading}
        clientInactive={false}
      />
    );

    expect(getByText(/no data found/i)).toBeInTheDocument();
  });

  test("shows client inactive message when clientInactive is true", () => {
    const { getByText } = render(
      <FormStatusMessage
        status={{} as FormStatus}
        formType={formType}
        formActionLoading={formActionLoading}
        clientInactive={true}
      />
    );

    expect(getByText(/client is currently deactivated/i)).toBeInTheDocument();
  });

  test("shows revoked message with formatted date", () => {
    const revokedAt = "2020-01-01T00:00:00Z";
    const formattedDate = formatDate(revokedAt);

    const { getByText, getAllByText } = render(
      <FormStatusMessage
        status={{ submitted: false, activeToken: false, revokedAt }}
        formType={formType}
        formActionLoading={formActionLoading}
        clientInactive={false}
      />
    );

    expect(getByText(/form revoked on/i)).toBeInTheDocument();

    const dateElements = getAllByText(
      (_content, element) =>
        element?.querySelector("strong")?.textContent === formattedDate
    );
    expect(dateElements[0]).toBeInTheDocument();
  });

  test("shows pending response when activeToken is true", () => {
    const tokenCreatedAt = "2023-01-01T00:00:00Z";
    const formattedDate = formatDate(tokenCreatedAt);

    const { getByText, getAllByText } = render(
      <FormStatusMessage
        status={{ submitted: false, activeToken: true, tokenCreatedAt }}
        formType={formType}
        formActionLoading={formActionLoading}
        clientInactive={false}
      />
    );

    expect(getByText(/form sent on/i)).toBeInTheDocument();
    expect(getByText(/pending response/i)).toBeInTheDocument();

    const dateElements = getAllByText(
      (_content, element) =>
        element?.querySelector("strong")?.textContent === formattedDate
    );
    expect(dateElements[0]).toBeInTheDocument();
  });

  test("shows submitted message with formatted date", () => {
    const submittedAt = "2023-02-01T00:00:00Z";
    const formattedDate = formatDate(submittedAt);

    const { getByText, getAllByText } = render(
      <FormStatusMessage
        status={{ submitted: true, activeToken: false, submittedAt }}
        formType={formType}
        formActionLoading={formActionLoading}
        clientInactive={false}
      />
    );

    expect(getByText(/form submitted on/i)).toBeInTheDocument();

    const dateElements = getAllByText(
      (_content, element) =>
        element?.querySelector("strong")?.textContent === formattedDate
    );
    expect(dateElements[0]).toBeInTheDocument();
  });

  test("shows expired message when tokenExpiresAt is in the past", () => {
    const tokenExpiresAt = "2000-01-01T00:00:00Z";
    const formattedDate = formatDate(tokenExpiresAt);

    const { getByText } = render(
      <FormStatusMessage
        status={{ submitted: false, activeToken: false, tokenExpiresAt }}
        formType={formType}
        formActionLoading={formActionLoading}
        clientInactive={false}
      />
    );

    expect(
      getByText(
        (content, element) =>
          content.includes("Form expired on") &&
          element?.querySelector("strong")?.textContent === formattedDate
      )
    ).toBeInTheDocument();
  });

  test("shows 'Form not yet sent' when no other conditions match", () => {
    const { getByText } = render(
      <FormStatusMessage
        status={{} as FormStatus}
        formType={formType}
        formActionLoading={formActionLoading}
        clientInactive={false}
      />
    );

    expect(getByText(/form not yet sent/i)).toBeInTheDocument();
  });

  test("formatDate returns empty string for undefined, null, or invalid date", () => {
    expect(formatDate(undefined)).toBe("");
    expect(formatDate(null)).toBe("");
    expect(formatDate("invalid-date")).toBe("");
    expect(formatDate(new Date("invalid-date"))).toBe("");
  });

  test("formatDate returns formatted date string for valid Date or ISO string", () => {
    const date = new Date("2025-09-01T12:00:00Z");
    const iso = "2025-09-01T12:00:00Z";

    const expected = new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    expect(formatDate(date)).toBe(expected);
    expect(formatDate(iso)).toBe(expected);
  });
});
