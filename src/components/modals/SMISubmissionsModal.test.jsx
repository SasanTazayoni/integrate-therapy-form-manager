import { render, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import SMISubmissionsModal from "./SMISubmissionsModal";
import { useClientContext } from "../../context/ClientContext";
import { fetchAllSmiForms } from "../../api/formsFrontend";

vi.mock("../../context/ClientContext");
vi.mock("../../api/formsFrontend");

beforeEach(() => {
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  }
  modalRoot.innerHTML = "";
});

describe("SMISubmissionsModal", () => {
  const mockSetLocalSmiScores = vi.fn();
  const mockSetLocalSmiSubmittedAt = vi.fn();
  const mockOnClose = vi.fn();
  const mockEmail = "test@example.com";

  beforeEach(() => {
    vi.clearAllMocks();
    useClientContext.mockReturnValue({ email: mockEmail });
  });

  test("does not render when isOpen is false", () => {
    const { queryByText } = render(
      <SMISubmissionsModal
        isOpen={false}
        onClose={mockOnClose}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    expect(queryByText(/Previous SMI Submissions/i)).toBeNull();
  });

  test("renders modal with loader initially and shows empty message", async () => {
    fetchAllSmiForms.mockResolvedValue({
      ok: true,
      data: { smiForms: [] },
    });

    const { getByTestId, queryByTestId } = render(
      <SMISubmissionsModal
        isOpen={true}
        onClose={mockOnClose}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    expect(getByTestId("smi-loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(queryByTestId("smi-loading")).toBeNull();
      expect(getByTestId("smi-error")).toHaveTextContent(
        "No SMI submissions found."
      );
    });
  });

  test("renders a list of SMI submissions", async () => {
    fetchAllSmiForms.mockResolvedValue({
      ok: true,
      data: {
        smiForms: [
          {
            id: "1",
            submittedAt: "2025-09-06T00:00:00Z",
            smiScores: { vc: "1.0-Average" },
          },
        ],
      },
    });

    const { getByTestId } = render(
      <SMISubmissionsModal
        isOpen={true}
        onClose={mockOnClose}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    const formItem = await waitFor(() => getByTestId("smi-form-item-1"));
    expect(formItem).toBeInTheDocument();
    expect(formItem).toHaveTextContent("6 Sept 2025");
  });

  test("selects an SMI submission correctly", async () => {
    const smiForm = {
      id: "1",
      submittedAt: "2025-09-06T00:00:00Z",
      smiScores: { vc: "1.0-Average" },
    };

    fetchAllSmiForms.mockResolvedValue({
      ok: true,
      data: { smiForms: [smiForm] },
    });

    const { getByTestId } = render(
      <SMISubmissionsModal
        isOpen={true}
        onClose={mockOnClose}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    const formItem = await waitFor(() => getByTestId("smi-form-item-1"));
    fireEvent.click(formItem);

    await waitFor(() => {
      expect(mockSetLocalSmiScores).toHaveBeenCalledWith({
        smi_vc_score: "1.0-Average",
      });
      expect(mockSetLocalSmiSubmittedAt).toHaveBeenCalledWith("6 Sept 2025");
    });
  });

  test("clicking close button calls onClose", () => {
    const { getByText } = render(
      <SMISubmissionsModal
        isOpen={true}
        onClose={mockOnClose}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    const closeButton = getByText(/Close/i);
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("normalizes undefined and null values to null", async () => {
    fetchAllSmiForms.mockResolvedValue({
      ok: true,
      data: {
        smiForms: [
          {
            id: "1",
            submittedAt: "2025-09-06T00:00:00Z",
            smiScores: {
              vc: undefined,
              ac: null,
              ec: "5",
            },
          },
        ],
      },
    });

    const { getByTestId } = render(
      <SMISubmissionsModal
        isOpen={true}
        onClose={mockOnClose}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    const formItem = await waitFor(() => getByTestId("smi-form-item-1"));
    fireEvent.click(formItem);

    await waitFor(() => {
      expect(mockSetLocalSmiScores).toHaveBeenCalledWith({
        smi_vc_score: null,
        smi_ac_score: null,
        smi_ec_score: "5",
      });
    });
  });

  test("sets error and clears forms if no client email is available", async () => {
    useClientContext.mockReturnValue({ email: null });

    const { getByTestId, queryByTestId } = render(
      <SMISubmissionsModal
        isOpen={true}
        onClose={mockOnClose}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    expect(queryByTestId("smi-loading")).toBeNull();

    await waitFor(() => {
      expect(getByTestId("smi-error")).toHaveTextContent(
        "No client email available."
      );
    });
  });

  test("shows error and clears forms when fetchAllSmiForms returns ok: false", async () => {
    fetchAllSmiForms.mockResolvedValue({
      ok: false,
      data: { error: "some backend failure" },
    });

    const { getByTestId, queryByTestId } = render(
      <SMISubmissionsModal
        isOpen={true}
        onClose={mockOnClose}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    expect(getByTestId("smi-loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(queryByTestId("smi-loading")).toBeNull();

      expect(getByTestId("smi-error")).toHaveTextContent(
        "Failed to fetch SMI submissions."
      );

      expect(queryByTestId("smi-form-list")).toBeNull();
    });
  });

  test("sets error and clears forms when fetchAllSmiForms throws", async () => {
    fetchAllSmiForms.mockRejectedValueOnce(new Error("Network failure"));

    const { getByTestId, queryByTestId } = render(
      <SMISubmissionsModal
        isOpen={true}
        onClose={mockOnClose}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    expect(getByTestId("smi-loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(queryByTestId("smi-loading")).toBeNull();
      expect(getByTestId("smi-error")).toHaveTextContent(
        "Failed to fetch SMI submissions."
      );

      expect(queryByTestId("smi-form-list")).toBeNull();
    });
  });

  test("applies disabled class when smiScores is empty", async () => {
    fetchAllSmiForms.mockResolvedValueOnce({
      ok: true,
      data: {
        smiForms: [
          { id: "1", submittedAt: "2025-09-06T00:00:00Z", smiScores: {} },
        ],
      },
    });

    const { getByTestId } = render(
      <SMISubmissionsModal
        isOpen={true}
        onClose={mockOnClose}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    const formItem = await waitFor(() => getByTestId("smi-form-item-1"));
    expect(formItem).toHaveClass("cursor-not-allowed", "text-gray-400");
  });

  test("does not call handleSelect when disabled item is clicked", async () => {
    fetchAllSmiForms.mockResolvedValueOnce({
      ok: true,
      data: {
        smiForms: [
          { id: "1", submittedAt: "2025-09-06T00:00:00Z", smiScores: {} },
        ],
      },
    });

    const { getByTestId } = render(
      <SMISubmissionsModal
        isOpen={true}
        onClose={mockOnClose}
        setLocalSmiScores={mockSetLocalSmiScores}
        setLocalSmiSubmittedAt={mockSetLocalSmiSubmittedAt}
      />
    );

    const formItem = await waitFor(() => getByTestId("smi-form-item-1"));
    formItem.click();
    expect(mockSetLocalSmiScores).not.toHaveBeenCalled();
    expect(mockSetLocalSmiSubmittedAt).not.toHaveBeenCalled();
  });
});
