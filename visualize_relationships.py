#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
from pathlib import Path

# Keep matplotlib cache writable inside the project workspace.
os.environ.setdefault("MPLCONFIGDIR", ".mplconfig")

import numpy as np
import pandas as pd
import seaborn as sns
from matplotlib import pyplot as plt


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create correlation visualizations for levels.csv."
    )
    parser.add_argument(
        "--input",
        default="parsed_scaled/levels.csv",
        help="Path to input CSV (relative to project root).",
    )
    parser.add_argument(
        "--output-dir",
        default="analysis/relationships",
        help="Directory for output charts/tables (relative to project root).",
    )
    parser.add_argument(
        "--top-n",
        type=int,
        default=20,
        help="Number of strongest pairs to export in the ranked table.",
    )
    return parser.parse_args()


def upper_triangle_pairs(corr: pd.DataFrame) -> pd.DataFrame:
    mask = np.triu(np.ones_like(corr, dtype=bool), k=1)
    rows, cols = np.where(mask)
    out = pd.DataFrame(
        {
            "var_1": corr.index.values[rows],
            "var_2": corr.columns.values[cols],
            "correlation": corr.values[rows, cols],
        }
    )
    out["abs_correlation"] = out["correlation"].abs()
    return out.sort_values("abs_correlation", ascending=False).reset_index(drop=True)


def save_full_heatmap(corr: pd.DataFrame, output_path: Path) -> None:
    plt.figure(figsize=(14, 12))
    sns.heatmap(
        corr,
        cmap="coolwarm",
        center=0,
        square=True,
        cbar_kws={"label": "Pearson correlation"},
    )
    plt.title("Full Correlation Heatmap (Numeric Variables)")
    plt.tight_layout()
    plt.savefig(output_path, dpi=220)
    plt.close()


def save_top_block_heatmap(corr: pd.DataFrame, output_path: Path, top_features: list[str]) -> None:
    subset = corr.loc[top_features, top_features]
    plt.figure(figsize=(10, 8))
    sns.heatmap(
        subset,
        cmap="coolwarm",
        center=0,
        annot=True,
        fmt=".2f",
        square=True,
        cbar_kws={"label": "Pearson correlation"},
    )
    plt.title("Focused Heatmap: Most Connected Variables")
    plt.tight_layout()
    plt.savefig(output_path, dpi=220)
    plt.close()


def main() -> None:
    args = parse_args()
    project_root = Path(__file__).resolve().parent
    input_path = project_root / args.input
    output_dir = project_root / args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(input_path)
    numeric_df = df.select_dtypes(include=[np.number]).copy()

    corr = numeric_df.corr(numeric_only=True)
    ranked_pairs = upper_triangle_pairs(corr)
    ranked_pairs.to_csv(output_dir / "top_correlations.csv", index=False)

    save_full_heatmap(corr, output_dir / "correlation_heatmap_full.png")

    connection_strength = corr.abs().sum().sort_values(ascending=False)
    top_features = connection_strength.head(10).index.tolist()
    save_top_block_heatmap(corr, output_dir / "correlation_heatmap_top10.png", top_features)

    print(f"Rows: {len(df):,}")
    print(f"Numeric variables used: {numeric_df.shape[1]}")
    print(f"Saved: {output_dir / 'correlation_heatmap_full.png'}")
    print(f"Saved: {output_dir / 'correlation_heatmap_top10.png'}")
    print(f"Saved: {output_dir / 'top_correlations.csv'}")
    print("\nTop relationships:")
    print(ranked_pairs.head(args.top_n).to_string(index=False))


if __name__ == "__main__":
    main()
