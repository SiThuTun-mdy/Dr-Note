import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSetTheme = vi.fn();
let mockTheme: string | undefined = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}));

import { Topbar } from "./Topbar";

const defaultProps = {
  onMenuClick: vi.fn(),
  pageTitle: "Dashboard",
  userName: "Jane Doe",
  userRole: "doctor",
};

async function openUserMenu() {
  const user = userEvent.setup();
  render(<Topbar {...defaultProps} />);
  const trigger = screen.getByRole("button", { name: "User menu" });
  await user.click(trigger);
  await waitFor(() => {
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
  return user;
}

describe("Topbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = "light";
  });

  afterEach(() => {
    cleanup();
  });

  describe("Basic rendering", () => {
    it("renders the page title", () => {
      render(<Topbar {...defaultProps} />);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("renders the user initials", () => {
      render(<Topbar {...defaultProps} />);
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("calls onMenuClick when the mobile menu button is clicked", async () => {
      const user = userEvent.setup();
      render(<Topbar {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: "Toggle menu" }));
      expect(defaultProps.onMenuClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Theme switcher", () => {
    it("renders the three theme options once the user menu is open", async () => {
      await openUserMenu();

      expect(
        screen.getByRole("button", { name: "Light theme" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Dark theme" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "System theme" })
      ).toBeInTheDocument();
    });

    it("reflects the current theme as the pressed item (light)", async () => {
      mockTheme = "light";
      await openUserMenu();

      expect(screen.getByRole("button", { name: "Light theme" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      expect(screen.getByRole("button", { name: "Dark theme" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
      expect(
        screen.getByRole("button", { name: "System theme" })
      ).toHaveAttribute("aria-pressed", "false");
    });

    it("reflects the current theme as the pressed item (dark)", async () => {
      mockTheme = "dark";
      await openUserMenu();

      expect(screen.getByRole("button", { name: "Dark theme" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      expect(screen.getByRole("button", { name: "Light theme" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });

    it("reflects the current theme as the pressed item (system)", async () => {
      mockTheme = "system";
      await openUserMenu();

      expect(
        screen.getByRole("button", { name: "System theme" })
      ).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: "Light theme" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
      expect(screen.getByRole("button", { name: "Dark theme" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });

    it("shows no item as pressed when theme is undefined", async () => {
      mockTheme = undefined;
      await openUserMenu();

      expect(screen.getByRole("button", { name: "Light theme" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
      expect(screen.getByRole("button", { name: "Dark theme" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
      expect(
        screen.getByRole("button", { name: "System theme" })
      ).toHaveAttribute("aria-pressed", "false");
    });

    it("calls setTheme('light') when the Light option is clicked", async () => {
      mockTheme = "dark";
      const user = await openUserMenu();

      await user.click(screen.getByRole("button", { name: "Light theme" }));

      expect(mockSetTheme).toHaveBeenCalledWith("light");
    });

    it("calls setTheme('dark') when the Dark option is clicked", async () => {
      mockTheme = "light";
      const user = await openUserMenu();

      await user.click(screen.getByRole("button", { name: "Dark theme" }));

      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });

    it("calls setTheme('system') when the System option is clicked", async () => {
      mockTheme = "light";
      const user = await openUserMenu();

      await user.click(screen.getByRole("button", { name: "System theme" }));

      expect(mockSetTheme).toHaveBeenCalledWith("system");
    });

    it("does not call setTheme when clicking the already-active option", async () => {
      mockTheme = "light";
      const user = await openUserMenu();

      // Clicking the pressed item toggles it off (value[0] becomes undefined),
      // and the component guards with `value[0] &&` so setTheme should not fire.
      await user.click(screen.getByRole("button", { name: "Light theme" }));

      expect(mockSetTheme).not.toHaveBeenCalled();
    });

    it("has a minimum 44x44 touch target on each theme option", async () => {
      await openUserMenu();

      for (const name of ["Light theme", "Dark theme", "System theme"]) {
        const button = screen.getByRole("button", { name });
        expect(button.className).toContain("min-h-[44px]");
        expect(button.className).toContain("min-w-[44px]");
      }
    });
  });
});
